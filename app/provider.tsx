"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";
import Preloader from "@/components/Preloader";

export type UsersDetail = {
  name: string;
  email: string;
  credits: number;
};

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const CreateNewUser = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await axios.post("/api/users");
      console.log(result.data);
      setUserDetail(result.data);
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (user && !userDetail && !isLoading) {
      CreateNewUser();
    }
  }, [user, userDetail, isLoading, CreateNewUser]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <Preloader />
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;
