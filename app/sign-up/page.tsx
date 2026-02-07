import React from "react";
import Signup from "../components/forms/auth/Signup";

const page = () => {
  return (
    <section className="h-screen w-full flex justify-center items-center">
      <article className="flex flex-col gap-8">
        <h1 className="text-4xl font-bold">Sign-up</h1>
        <Signup />
      </article>
    </section>
  );
};

export default page;
