import React from "react";
import { getCurrentUser } from "../../backend/lib/auth";

const page = async () => {
  const user = await getCurrentUser();
  return <div> welcome to Dashboard, {user?.name}</div>;
};

export default page;
