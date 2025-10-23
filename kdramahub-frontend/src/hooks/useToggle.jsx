import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";

export function useToggle({ dramaId, listName, addFn, removeFn }) {
  const { userData, loginUser } = useUser();
  const { showMessageModal } = useModal();

  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.[listName]) {
      setIsInList(userData[listName].includes(dramaId));
    } else {
      setIsInList(false);
    }
  }, [userData, dramaId, listName]);

  const toggle = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    if (!userData) {
      showMessageModal("Oops!", "You need to", true);
      return;
    }

    setLoading(true);
    try {
      const newState = !isInList;
      setIsInList(newState);

      let updatedList;
      if (newState) {
        await addFn(userData.id, dramaId, showMessageModal);
        updatedList = [...userData[listName], dramaId];
      } else {
        await removeFn(userData.id, dramaId, showMessageModal);
        updatedList = userData[listName].filter((id) => id !== dramaId);
      }

      loginUser({ ...userData, [listName]: updatedList });
    } catch (err) {
      setIsInList(!isInList);
      showMessageModal("Oops!", `Failed to update ${listName}`);
    } finally {
      setLoading(false);
    }
  };

  return { isInList, toggle, loading, setIsInList };
}
