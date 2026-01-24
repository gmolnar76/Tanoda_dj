import React, { useState, useEffect } from "react";
import SponsorsList from "./SponsorsList";
import SponsorAddInput from "./SponsorAddInput";
import SponsorsActionBar from "./SponsorsActionBar";
import PaymentLinkModal from "./PaymentLinkModal";
import Toast from "./Toast";
import axios from "axios";

const API = "/api/monetization/sponsors/";

export default function SponsorsPanel() {
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsorIds, setSelectedSponsorIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [addEmailValue, setAddEmailValue] = useState("");
  const [addEmailError, setAddEmailError] = useState("");
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentLinkState, setPaymentLinkState] = useState({
    amount: 2500,
    customAmount: "",
    purpose: "Tanoda támogatás",
    link: "",
    loading: false,
    error: "",
    copied: false,
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get(API)
      .then(res => setSponsors(res.data))
      .catch(() => setSponsors([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddSponsor = () => {
    if (!validateEmail(addEmailValue)) {
      setAddEmailError("Ez nem tűnik érvényes e-mail címnek.");
      return;
    }
    setActionLoading(true);
    axios.post(API, { email: addEmailValue })
      .then(res => {
        setSponsors([...sponsors, res.data]);
        setAddEmailValue("");
        setAddEmailError("");
        setToast({ type: "success", message: "Finanszírozó hozzáadva." });
      })
      .catch(() => setAddEmailError("Hiba történt."))
      .finally(() => setActionLoading(false));
  };

  const handleDeleteSponsor = (id) => {
    setActionLoading(true);
    axios.delete(`${API}${id}/`)
      .then(() => {
        setSponsors(sponsors.filter(s => s.id !== id));
        setSelectedSponsorIds(selectedSponsorIds.filter(sid => sid !== id));
        setToast({ type: "success", message: "Törölve." });
      })
      .catch(() => setToast({ type: "error", message: "Hiba törléskor." }))
      .finally(() => setActionLoading(false));
  };

  const handleSendInvitation = () => {
    setActionLoading(true);
    axios.post("/api/monetization/invitations/send/", {
      sponsor_ids: selectedSponsorIds,
      role: "sponsor"
    })
      .then(() => setToast({ type: "success", message: "Meghívó elküldve." }))
      .catch(() => setToast({ type: "error", message: "Hiba meghívó küldésekor." }))
      .finally(() => setActionLoading(false));
  };

  const handleOpenPaymentLink = () => setShowPaymentLinkModal(true);
  const handleClosePaymentLink = () => setShowPaymentLinkModal(false);

  const filteredSponsors = sponsors.filter(s =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <h2>Finanszírozók</h2>
      <SponsorAddInput
        value={addEmailValue}
        error={addEmailError}
        loading={actionLoading}
        onChange={setAddEmailValue}
        onAdd={handleAddSponsor}
      />
      <SponsorsList
        sponsors={filteredSponsors}
        selectedIds={selectedSponsorIds}
        onSelect={setSelectedSponsorIds}
        onDelete={handleDeleteSponsor}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <SponsorsActionBar
        disabled={!selectedSponsorIds.length || actionLoading}
        onSendInvitation={handleSendInvitation}
        onOpenPaymentLink={handleOpenPaymentLink}
        selectedCount={selectedSponsorIds.length}
        loading={actionLoading}
      />
      {showPaymentLinkModal && (
        <PaymentLinkModal
          sponsorIds={selectedSponsorIds}
          state={paymentLinkState}
          setState={setPaymentLinkState}
          onClose={handleClosePaymentLink}
          setToast={setToast}
        />
      )}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
