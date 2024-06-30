import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

const withSession = (
  Component: React.FC,
  redirectTo: string,
  sessionCondition: boolean
) => {
  return () => {
    const { session } = useSession();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (session !== sessionCondition) {
        navigate(redirectTo);
      } else {
        setLoading(false);
      }
    }, [session, navigate ]);

    if (loading) {
      return (
        <div
          style={{ backgroundColor: "white", height: "100vh", width: "100vw" }}
        />
      );
    }

    return <Component />;
  };
};

export default withSession;
