import cv2
import numpy as np
from ultralytics import YOLO


# ==========================================
# Initialize YOLO Pose Model
# ==========================================

model = YOLO("yolo11n-pose.pt")


# ==========================================
# Open Webcam
# ==========================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()


# ==========================================
# Body Keypoint Connections
# ==========================================

connections = [
    (5, 6),    # Left Shoulder  - Right Shoulder
    (5, 7),    # Left Shoulder  - Left Elbow
    (7, 9),    # Left Elbow     - Left Wrist
    (6, 8),    # Right Shoulder - Right Elbow
    (8, 10),   # Right Elbow    - Right Wrist
    (5, 11),   # Left Shoulder  - Left Hip
    (6, 12),   # Right Shoulder - Right Hip
    (11, 12),  # Left Hip       - Right Hip
    (11, 13),  # Left Hip       - Left Knee
    (13, 15),  # Left Knee      - Left Ankle
    (12, 14),  # Right Hip      - Right Knee
    (14, 16),  # Right Knee     - Right Ankle
]

# YOLO-pose keypoint indices
KP_LEFT_SHOULDER  = 5
KP_RIGHT_SHOULDER = 6
KP_LEFT_ELBOW     = 7
KP_RIGHT_ELBOW    = 8
KP_LEFT_WRIST     = 9
KP_RIGHT_WRIST    = 10
KP_LEFT_HIP       = 11
KP_RIGHT_HIP      = 12
KP_LEFT_KNEE      = 13
KP_RIGHT_KNEE     = 14
KP_LEFT_ANKLE     = 15
KP_RIGHT_ANKLE    = 16


# ==========================================
# Angle / Geometry Utilities
# ==========================================

def angle_between(a, b, c):
    """
    Compute the angle at vertex B formed by points A-B-C.
    Returns degrees in [0, 180].
    """
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    cos_val = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    return float(np.degrees(np.arccos(np.clip(cos_val, -1.0, 1.0))))


def midpoint(p1, p2):
    return ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)


def is_visible(*pts, threshold=10):
    """Return True only if ALL supplied points have non-zero (x, y)."""
    return all(x > threshold and y > threshold for x, y in pts)


# ==========================================
# Push-Up Form Checks
# ==========================================
# Thresholds — tweak if needed for your camera angle
BACK_STRAIGHT_TOLERANCE   = 20   # degrees deviation from flat (180°) allowed
ELBOW_FLARE_MAX           = 110  # max elbow angle at DOWN position (fully bent)
ELBOW_FLARE_MIN           = 60   # min elbow angle at DOWN position (not too wide)
ELBOW_UP_MIN              = 140  # minimum elbow angle to qualify as UP/READY
DEPTH_SHOULDER_HIP_MIN    = 0.06 # shoulder must drop at least 6 % of frame height


def check_back_alignment(left_shoulder, right_shoulder,
                         left_hip, right_hip,
                         left_knee, right_knee, frame_h):
    """
    Checks that shoulder–hip–knee lie roughly on a straight line
    (i.e., body does not sag or pike).
    Returns (ok: bool, angle: float)
    """
    mid_shoulder = midpoint(left_shoulder, right_shoulder)
    mid_hip      = midpoint(left_hip, right_hip)
    mid_knee     = midpoint(left_knee, right_knee)
    ang = angle_between(mid_shoulder, mid_hip, mid_knee)
    # 180° = perfectly straight; allow BACK_STRAIGHT_TOLERANCE deviation
    ok = abs(ang - 180) <= BACK_STRAIGHT_TOLERANCE
    return ok, ang


def check_elbow_angle(left_shoulder, left_elbow, left_wrist,
                      right_shoulder, right_elbow, right_wrist):
    """
    Returns average elbow angle and whether it's in the valid DOWN range.
    """
    left_ang  = angle_between(left_shoulder,  left_elbow,  left_wrist)
    right_ang = angle_between(right_shoulder, right_elbow, right_wrist)
    avg = (left_ang + right_ang) / 2
    ok = ELBOW_FLARE_MIN <= avg <= ELBOW_FLARE_MAX
    return ok, avg


def check_elbow_up(left_shoulder, left_elbow, left_wrist,
                   right_shoulder, right_elbow, right_wrist):
    """
    Returns True when both elbows are sufficiently extended (UP position).
    """
    left_ang  = angle_between(left_shoulder,  left_elbow,  left_wrist)
    right_ang = angle_between(right_shoulder, right_elbow, right_wrist)
    ok = left_ang >= ELBOW_UP_MIN and right_ang >= ELBOW_UP_MIN
    return ok, (left_ang + right_ang) / 2


# ==========================================
# State Machine
# ==========================================
# States:
#   READY  – user is in starting (up) position and form is good
#   DOWN   – user has lowered; tracking form for a valid rep
#   UP     – user has risen; rep is confirmed if form was good throughout
#
# Transitions that ACTUALLY count:
#   READY  →  DOWN   (elbows bend past ELBOW_UP_MIN while back is straight)
#   DOWN   →  [form check] → UP  → rep +1
#   Any form failure while counting → state resets, rep NOT counted

STATE_READY = "READY"
STATE_DOWN  = "DOWN"
STATE_UP    = "UP"

state             = STATE_READY
rep_count         = 0
feedback          = "Get into push-up position"
feedback_color    = (200, 200, 200)

# Form flag: set False the moment any form error is detected in DOWN state.
# Rep only counts if this is still True when we exit DOWN back to UP.
form_ok_this_rep  = True

# Track shoulder Y at the top of each rep to measure descent depth
shoulder_y_at_top = None


# ==========================================
# HUD Drawing Helpers
# ==========================================

def draw_hud(frame, count, state, feedback, feedback_color):
    h, w = frame.shape[:2]

    # Semi-transparent dark panel at top
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 90), (20, 20, 20), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

    # Rep count
    cv2.putText(frame, f"Reps: {count}", (20, 55),
                cv2.FONT_HERSHEY_SIMPLEX, 1.8, (0, 255, 128), 3, cv2.LINE_AA)

    # State badge
    state_color = {
        STATE_READY: (255, 200, 0),
        STATE_DOWN:  (0, 180, 255),
        STATE_UP:    (0, 255, 128),
    }.get(state, (200, 200, 200))
    cv2.putText(frame, state, (w - 200, 55),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, state_color, 2, cv2.LINE_AA)

    # Feedback bar at bottom
    overlay2 = frame.copy()
    cv2.rectangle(overlay2, (0, h - 55), (w, h), (10, 10, 10), -1)
    cv2.addWeighted(overlay2, 0.65, frame, 0.35, 0, frame)
    cv2.putText(frame, feedback, (20, h - 18),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, feedback_color, 2, cv2.LINE_AA)

    return frame


# ==========================================
# Main Loop
# ==========================================

while True:

    ret, frame = cap.read()

    if not ret:
        print("Error: Could not read frame.")
        break

    # Mirror view (selfie-style)
    frame = cv2.flip(frame, 1)
    frame_h, frame_w = frame.shape[:2]


    # ======================================
    # YOLO Pose Detection
    # ======================================

    results = model(frame, verbose=False, conf=0.5)


    # ======================================
    # Process Detected Persons
    # ======================================

    person_detected = False

    for result in results:

        if result.keypoints is None:
            continue

        keypoints = result.keypoints.xy.cpu().numpy()

        for person in keypoints:

            if len(person) < 17:
                continue

            # ---- Extract landmarks ----
            ls  = person[KP_LEFT_SHOULDER]
            rs  = person[KP_RIGHT_SHOULDER]
            le  = person[KP_LEFT_ELBOW]
            re  = person[KP_RIGHT_ELBOW]
            lw  = person[KP_LEFT_WRIST]
            rw  = person[KP_RIGHT_WRIST]
            lh  = person[KP_LEFT_HIP]
            rh  = person[KP_RIGHT_HIP]
            lk  = person[KP_LEFT_KNEE]
            rk  = person[KP_RIGHT_KNEE]
            la  = person[KP_LEFT_ANKLE]
            ra  = person[KP_RIGHT_ANKLE]

            # ---- Visibility guard ----
            core_visible = is_visible(ls, rs, le, re, lw, rw, lh, rh, lk, rk)
            if not core_visible:
                feedback       = "Full body not visible"
                feedback_color = (0, 150, 255)
                person_detected = True
                break

            person_detected = True

            # ---- Compute form metrics ----
            back_ok, back_ang        = check_back_alignment(ls, rs, lh, rh, lk, rk, frame_h)
            elbow_down_ok, elbow_down_ang = check_elbow_angle(ls, le, lw, rs, re, rw)
            elbow_up_ok,   elbow_cur_ang  = check_elbow_up(ls, le, lw, rs, re, rw)

            mid_shoulder_y = (ls[1] + rs[1]) / 2

            # ============================================================
            # STATE MACHINE
            # ============================================================

            if state == STATE_READY:
                # ---- READY: waiting for user to be in good UP position ----
                if back_ok and elbow_up_ok:
                    # Keep refreshing the top-of-rep anchor every frame
                    # so depth is measured from the actual top position.
                    shoulder_y_at_top = mid_shoulder_y
                    form_ok_this_rep  = True
                    feedback       = "Good — lower into push-up"
                    feedback_color = (0, 255, 128)
                    # Transition: user starts bending elbows → enter DOWN
                    # (elbow_up_ok is True only when angle >= ELBOW_UP_MIN,
                    #  so this frame they are still extended; next frame
                    #  when they bend, elbow_up_ok → False → we switch)
                elif back_ok and not elbow_up_ok and shoulder_y_at_top is not None:
                    # Elbows just bent past the UP threshold → start tracking
                    state            = STATE_DOWN
                    form_ok_this_rep = True
                    feedback       = "Descending — maintain form!"
                    feedback_color = (0, 200, 255)
                elif not back_ok:
                    feedback       = f"Straighten your back ({back_ang:.0f}°)"
                    feedback_color = (0, 0, 255)
                    shoulder_y_at_top = None  # reset anchor; form was bad at top
                else:
                    feedback       = "Extend arms fully to start"
                    feedback_color = (0, 200, 255)
                    shoulder_y_at_top = None

            elif state == STATE_DOWN:
                # ---- DOWN: user is lowering / at bottom ----

                # --- FORM CHECK 1: Back alignment ---
                if not back_ok:
                    form_ok_this_rep = False
                    feedback       = f"FORM ERROR: Straighten your back ({back_ang:.0f}°)"
                    feedback_color = (0, 0, 255)

                # --- FORM CHECK 2: Elbow alignment at bottom ---
                elif not elbow_down_ok:
                    form_ok_this_rep = False
                    if elbow_down_ang > ELBOW_FLARE_MAX:
                        feedback   = f"FORM ERROR: Elbows too wide ({elbow_down_ang:.0f}°)"
                    else:
                        feedback   = f"FORM ERROR: Go deeper ({elbow_down_ang:.0f}°)"
                    feedback_color = (0, 0, 255)

                else:
                    if form_ok_this_rep:
                        feedback       = "Good form — now push up!"
                        feedback_color = (0, 255, 0)

                # --- FORM CHECK 3: Depth (shoulder must descend enough) ---
                if shoulder_y_at_top is not None:
                    descent = (mid_shoulder_y - shoulder_y_at_top) / frame_h
                    # Only enforce depth once the user is near the bottom
                    # (elbow bent at least to ELBOW_FLARE_MAX level)
                    at_bottom = elbow_down_ang <= ELBOW_FLARE_MAX
                    if at_bottom and descent < DEPTH_SHOULDER_HIP_MIN:
                        form_ok_this_rep = False
                        feedback       = "FORM ERROR: Not deep enough"
                        feedback_color = (0, 0, 255)

                # --- Transition to UP when elbows fully extend again ---
                if elbow_up_ok:
                    state = STATE_UP

            elif state == STATE_UP:
                # ---- UP: user has pushed back to top ----

                if back_ok and form_ok_this_rep:
                    # All critical form gates passed — count the rep!
                    rep_count     += 1
                    feedback       = f"Rep {rep_count} counted!"
                    feedback_color = (0, 255, 128)
                else:
                    # Form failed somewhere during the rep — do NOT count
                    if not back_ok:
                        feedback   = f"Rep NOT counted: back not aligned ({back_ang:.0f}°)"
                    else:
                        feedback   = "Rep NOT counted: fix your form and retry"
                    feedback_color = (0, 80, 255)

                # Reset to READY regardless — user must perform a fresh rep
                state             = STATE_READY
                form_ok_this_rep  = True
                shoulder_y_at_top = None

            # ============================================================
            # Draw Skeleton
            # ============================================================

            for x, y in person:
                if x > 0 and y > 0:
                    cv2.circle(frame, (int(x), int(y)), 5, (0, 255, 0), -1)

            for start_idx, end_idx in connections:
                if start_idx >= len(person) or end_idx >= len(person):
                    continue
                x1, y1 = person[start_idx]
                x2, y2 = person[end_idx]
                if x1 > 0 and y1 > 0 and x2 > 0 and y2 > 0:
                    cv2.line(frame,
                             (int(x1), int(y1)),
                             (int(x2), int(y2)),
                             (255, 255, 255), 2)

            # Only process the first person detected
            break

        break  # Only process the first result set

    if not person_detected:
        feedback       = "No person detected"
        feedback_color = (0, 150, 255)


    # ======================================
    # Display HUD
    # ======================================

    frame = draw_hud(frame, rep_count, state, feedback, feedback_color)

    cv2.imshow("Push-Up Counter — YOLO Pose", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# ==========================================
# Release Resources
# ==========================================

cap.release()
cv2.destroyAllWindows()