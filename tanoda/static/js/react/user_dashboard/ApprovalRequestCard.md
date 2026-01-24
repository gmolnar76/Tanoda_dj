# ApprovalRequestCard API

## Props

| Name    | Type                                 | Description                                      |
|---------|--------------------------------------|--------------------------------------------------|
| request | { id, message, status, createdAt }   | Az approval request objektum                     |
| onApprove | (id: number) => void               | Jóváhagyás callback                              |
| onReject  | (id: number) => void               | Elutasítás callback                              |
| busy      | "approve" \| "reject" \| null     | Aktív művelet típusa (gomb disable, felirat)     |
| error     | string \| null                     | Hibaüzenet, piros sorban jelenik meg             |

## Viselkedés

- Ha `status !== "pending"` → gombok disabled
- Ha `busy === "approve"` → Approve gomb disabled, felirat: "Mentés..."
- Ha `busy === "reject"` → Reject gomb disabled, felirat: "Mentés..."
- Hiba esetén az error prop piros sorban jelenik meg

## Példa használat

```jsx
<ApprovalRequestCard
  request={request}
  onApprove={handleApprove}
  onReject={handleReject}
  busy={busyMap[request.id]}
  error={errorMap[request.id]}
/>
```
