import ChatIcon from "./chat-icon";
import ReactTooltip from "react-tooltip";
import { signOut, User, Auth } from "firebase/auth";

const UserControl = ({
  user,
  auth,
  onSignOut,
}: {
  user: User;
  auth: Auth;
  onSignOut: () => void;
}) => {
  return (
    <div>
      <button data-tip data-for="userControl" data-event="click">
        <ChatIcon
          src={user.photoURL ?? "/user.png"}
          className="mx-2 border-2 border-blue-300"
        />
      </button>
      <ReactTooltip
        place="right"
        effect="solid"
        id="userControl"
        clickable={true}
        globalEventOff="click"
      >
        <div>ログイン中：{user?.displayName}</div>
        <button
          onClick={() => {
            signOut(auth).then(onSignOut);
          }}
          className="my-2 rounded bg-red-500 py-1 px-2 font-bold text-white hover:bg-red-600"
        >
          ログアウト
        </button>
      </ReactTooltip>
    </div>
  );
};

export default UserControl;
