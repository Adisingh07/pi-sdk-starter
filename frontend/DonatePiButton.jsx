import React, { useEffect, useRef, useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api/payments";

const DonatePiButton = ({ amount = 0.5, to = "receiver" }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const accessTokenRef = useRef(null);

  useEffect(() => {
    const initPi = async () => {
      while (!window.Pi) {
        await new Promise((r) => setTimeout(r, 500));
      }

      try {
        await window.Pi.init({ version: "2.0" });

        const scopes = ["username", "payments"];
        let incomplete = null;

        const auth = await window.Pi.authenticate(scopes, (payment) => {
          if (payment) incomplete = payment;
        });

        const token = auth?.accessToken;
        const user = auth?.user?.username;

        setAccessToken(token);
        setUsername(user);
        accessTokenRef.current = token;

        if (incomplete) {
          const { identifier: paymentId, transaction } = incomplete;
          const txid = transaction?.txid;

          if (paymentId && txid) {
            try {
              await axios.post(`${API_BASE}/complete`, {
                paymentId,
                txid,
                accessToken: token,
              });
              setStatus("Recovered previous payment");
            } catch {
              setStatus("Failed to recover payment");
            }
          }
        }
      } catch {
        setStatus("Authentication failed");
      }
    };

    initPi();
  }, []);

  const handleDonate = async () => {
    setIsProcessing(true);
    setStatus("Creating payment...");

    const paymentData = {
      amount,
      memo: "Thank you for supporting 💜",
      metadata: { purpose: "donation", from: username },
      to,
    };

    const callbacks = {
      onReadyForServerApproval: async (paymentId) => {
        try {
          await axios.post(`${API_BASE}/approve`, {
            paymentId,
            accessToken: accessTokenRef.current,
          });
          setStatus("Payment approved");
        } catch {
          setStatus("Approval failed");
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        try {
          await axios.post(`${API_BASE}/complete`, {
            paymentId,
            txid,
            accessToken: accessTokenRef.current,
          });
          setStatus("Payment completed");
        } catch {
          setStatus("Completion failed");
        }
      },
      onCancel: () => setStatus("User cancelled"),
      onError: () => setStatus("Payment error"),
    };

    try {
      await window.Pi.createPayment(paymentData, callbacks);
    } catch {
      setStatus("Payment creation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleDonate}
        disabled={!accessToken || isProcessing}
        variant="contained"
        color="warning"
        startIcon={isProcessing && <CircularProgress size={18} color="inherit" />}
      >
        {isProcessing ? "Processing..." : "💎 Donate Pi"}
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        {status}
      </Typography>
    </>
  );
};

export default DonatePiButton;
