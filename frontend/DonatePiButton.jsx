import React, { useRef, useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api/payments";

const DonatePiButton = ({ amount = 0.5, to = "receiver" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const accessTokenRef = useRef(null);

  const handleDonate = async () => {
    setIsProcessing(true);
    setStatus("🛠 Authenticating...");

    try {
      if (!window.Pi) throw new Error("Pi SDK not loaded. Use Pi Browser.");

      await window.Pi.init({ version: "2.0" });
      const scopes = ["username", "payments"];

      let incomplete = null;

      const auth = await window.Pi.authenticate(scopes, (payment) => {
        if (payment) incomplete = payment;
      });

      const accessToken = auth?.accessToken;
      const username = auth?.user?.username;

      if (!accessToken || !username) throw new Error("Missing accessToken or username");

      accessTokenRef.current = accessToken;

      // Handle previous payment if exists
      if (incomplete?.identifier && incomplete.transaction?.txid) {
        try {
          await axios.post(`${API_BASE}/complete`, {
            paymentId: incomplete.identifier,
            txid: incomplete.transaction.txid,
            accessToken,
          });
          setStatus("✅ Previous payment completed");
        } catch {
          setStatus("⚠️ Could not recover payment");
        }
      }

      setStatus("⏳ Creating payment...");

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
            setStatus("✅ Payment approved");
          } catch {
            setStatus("❌ Approval failed");
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            await axios.post(`${API_BASE}/complete`, {
              paymentId,
              txid,
              accessToken: accessTokenRef.current,
            });
            setStatus("🎉 Payment completed");
          } catch {
            setStatus("❌ Completion failed");
          }
        },
        onCancel: () => setStatus("🚫 User cancelled"),
        onError: () => setStatus("❌ Payment error"),
      };

      await window.Pi.createPayment(paymentData, callbacks);
    } catch (err) {
      console.error(err);
      setStatus(`❌ ${err.message || "Unexpected error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleDonate}
        disabled={isProcessing}
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
