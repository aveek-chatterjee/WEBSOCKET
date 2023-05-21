import React, { useState, useRef } from "react";
import "./App.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "./api/posts";

const Post = ({ socket, title, id }) => {
  const [postMeta, setPostMeta] = useState({
    isEditModeOn: false,
    title,
    id,
  });
  const inputRef = useRef();

  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      queryClient.setQueryData(["posts"], data);
      queryClient.invalidateQueries(["posts"], { exact: true });
      setPostMeta({
        ...postMeta,
        title: postMeta.title,
        isEditModeOn: false,
      });
      const messageData = {
        room: 1,
        title: postMeta.title,
        id,
      };
      socket.emit("send_message", messageData);
    },
    onMutate: ({ title }) => {
      setPostMeta({
        ...postMeta,
        title,
        isEditModeOn: false,
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const updatePost = (e) => {
    e.preventDefault();
    createPostMutation.mutate({
      title: inputRef?.current?.value,
      id,
    });
    setPostMeta({
      ...postMeta,
      title: inputRef?.current?.value,
      isEditModeOn: false,
    });
  };

  socket.on("receive_message", (post) => {
    console.log("post data  === ", post);
    if (post?.id === id) {
      console.log(post);
      setPostMeta({
        ...postMeta,
        isEditModeOn: false,
        title: post?.title,
      });
    }
  });

  return (
    <>
      <div className="post">
        {!postMeta.isEditModeOn && <span>{postMeta?.title}</span>}
        {postMeta.isEditModeOn && (
          <input
            type="text"
            style={{ width: "70%" }}
            defaultValue={postMeta?.title}
            ref={inputRef}
          />
        )}
        <span>
          {!postMeta.isEditModeOn && (
            <button
              onClick={() =>
                setPostMeta({
                  ...postMeta,
                  isEditModeOn: !postMeta.isEditModeOn,
                })
              }
            >
              Edit
            </button>
          )}
          {postMeta.isEditModeOn && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                disabled={createPostMutation.isLoading}
                onClick={updatePost}
              >
                {createPostMutation.isLoading ? "Loading..." : "Save"}
              </button>
              <button
                disabled={createPostMutation.isLoading}
                onClick={() =>
                  setPostMeta({ ...postMeta, isEditModeOn: false })
                }
              >
                Cancel
              </button>
            </div>
          )}
        </span>
      </div>
    </>
  );
};

export default Post;
