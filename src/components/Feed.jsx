import React, { useEffect } from "react";
import UserCard from "./UserCard";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../redux/feedSlice";
import axios from "axios";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const feed2 = {
    firstName: "Jessica",
    age: 26,
    jobTitle: "Frontend Developer",
    photoUrl:
      "https://i.pinimg.com/originals/8e/21/29/8e2129f44804db65316ed3db92cf8552.jpg",
    skills: ["JavaScript", "React", "Node.js", "Python"],
  };
  const dispatch = useDispatch();

  const getFeed = async () => {
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });

      dispatch(addFeed(res?.data?.data));
    } catch (err) {
      //TODO: Handle Error
      console.log(err);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  if (!feed) return;

  if (feed.length <= 0)
    return <h1 className="text-center text-white mt-20 text-5xl">No User Found!</h1>;

  return (
    feed && (
      <div>
        <UserCard user={feed[0]} />
      </div>
    )
  );
};

export default Feed;
