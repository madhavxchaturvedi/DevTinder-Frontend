import React from "react";
import { useSelector } from "react-redux";

const Header = () => {
  const user = useSelector((store) => store.user);
  // console.log(user);
  return (
    <div className="navbar bg-transparent shadow-none px-6 absolute w-full z-50">
      <div className="flex-1">
        <a className="text-2xl font-bold bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] via-30% to-[#fe6d27] inline-block text-transparent bg-clip-text">
          DevTinder
        </a>
      </div>
      {user && (
        <>
          <div className="flex gap-2">
            <p className="text-white pt-1 px-4 text-lg font-medium">
              Hello, {user.firstName}
              {user.lastName}
            </p>
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img alt="Profile" src={user.photoUrl} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
