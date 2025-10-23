import { useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { useSound } from "../context/SoundContext";
import { changePassword, deleteAccount } from "../js/fetch";
import X from "../assets/images/x.png";
import "../css/AccountInfo.css";

export function AccountInfo() {
  const { userData, setUserLogged, setUserData } = useUser();
  const { closeAccountInfo, showMessageModal } = useModal();
  const { hasSound, setHasSound } = useSound();
  const [changePass, setChangePass] = useState(false);
  const [deleteAcc, setDeleteAcc] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [animate, setAnimate] = useState(false);
  const formRef = useRef();
  const oldPasswordRef = useRef();
  const confirmRef = useRef();

  const handleLogout = () => {
    setUserLogged(false);
    setUserData(null);
    closeAccountInfo();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      confirmRef.current.setCustomValidity("Passwords don't match");
      confirmRef.current.reportValidity();
      return;
    } else {
      confirmRef.current.setCustomValidity("");
    }

    try {
      const result = await changePassword(
        userData.id,
        currentPassword,
        newPassword,
        confirmPassword,
        showMessageModal
      );

      if (!result.success) {
        oldPasswordRef.current.setCustomValidity(
          result.message || "Incorrect password"
        );
        oldPasswordRef.current.reportValidity();
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      formRef.current.reset();
      oldPasswordRef.current.setCustomValidity("");
      confirmRef.current.setCustomValidity("");
      setChangePass(false);

      showMessageModal?.("Success!", "Password changed successfully!");
    } catch (err) {
      showMessageModal?.("Error", "Something went wrong. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone!"
      )
    ) {
      return;
    }

    const result = await deleteAccount(userData.id, showMessageModal);

    if (result.success) {
      if (hasSound) {
        const audio = new Audio("/sounds/boop.mp3");
        audio.play();
      }

      setUserLogged(false);
      setUserData(null);
      closeAccountInfo();

      showMessageModal?.("Deleted", "Your account has been deleted.");
    }
  };

  return (
    <div className="account-info-overlay" onClick={closeAccountInfo}>
      {deleteAcc && (
        <div className="deleteDiv">
          <h1>Are you sure you want to delete your account?</h1>
          <button onClick={handleDelete} className="deleteBtn">
            Yes
          </button>
          <button onClick={() => setDeleteAcc(false)} className="deleteBtn">
            No
          </button>
        </div>
      )}
      <div className="account-info" onClick={(e) => e.stopPropagation()}>
        {changePass && (
          <form
            className="passwordForm"
            ref={formRef}
            onSubmit={handlePasswordChange}
          >
            <img
              src={X}
              className="account-info-close"
              onClick={() => setChangePass(false)}
              alt="Close"
            />
            <label>
              Your old password
              <input
                type="password"
                ref={oldPasswordRef}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "This is not your current password"
                  )
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </label>

            <label>
              Your new password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                onInvalid={(e) =>
                  e.target.setCustomValidity(
                    "New password must be at least 6 characters"
                  )
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </label>

            <label>
              Repeat your new password
              <input
                type="password"
                ref={confirmRef}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                onInvalid={(e) =>
                  e.target.setCustomValidity("Password doesn't match")
                }
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </label>

            <button
              type="submit"
              className={`changeBtn ${animate ? "sparkle" : ""}`}
            >
              Change password!
            </button>
          </form>
        )}

        <img
          src={X}
          className="account-info-close"
          onClick={closeAccountInfo}
          alt="Close"
        />

        <div className="info-holder">
          <p className="label">Name</p>
          <p className="Info">{userData.name}</p>
        </div>

        <div className="info-holder">
          <p className="label">Email</p>
          <p className="Info">{userData.email}</p>
        </div>

        <div className="info-sound">
          <p className="label">Sound: </p>
          <p
            className={hasSound ? "sound" : "label"}
            onClick={() => setHasSound(true)}
          >
            ON
          </p>
          <p
            className={!hasSound ? "sound" : "label"}
            onClick={() => setHasSound(false)}
          >
            OFF
          </p>
        </div>

        <button
          onClick={() => setChangePass(true)}
          className="changeBtn accountBtn"
        >
          Change password
        </button>
        <button className="accountBtn" onClick={() => setDeleteAcc(true)}>
          Delete account
        </button>
        <button onClick={handleLogout} className="logOutBtn">
          Log Out
        </button>
      </div>
    </div>
  );
}
