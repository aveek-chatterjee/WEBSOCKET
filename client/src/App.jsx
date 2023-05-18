import React from "react";
import "./App.css";
import io from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "./api/posts";
import Post from "./Post";

const socket = io.connect("http://localhost:3001");
socket.emit("join_room", 1);

const App = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) {
    return <h1>Unable to Fetch Posts</h1>;
  }

  // socket.on("receive_message", (post) => {
  //   console.log("post data  === ", post);
  // });

  return (
    <div className="App">
      {(data ?? []).map((post) => (
        <div key={post.id}>
          <Post socket={socket} {...post} />
        </div>
      ))}
    </div>
  );
};

export default App;