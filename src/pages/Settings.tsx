import { useRef, useState } from "react";
import { downloadBackup, restoreBackup } from "../lib/backup";
import { Button, Card, PageTitle } from "../components/ui";

export default function Settings() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onRestore(file: File | undefined) {
    if (!file) return;
    try {
      await restoreBackup(file);
      setMessage("✅ Backup restored. All your data is back.");
    } catch (err) {
      setMessage(
        "⚠️ " + (err instanceof Error ? err.message : "Could not read that file.")
      );
    }
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Settings" />

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-800">Backup your data</h2>
        <p className="text-stone-600">
          Your orders and recipes live on this phone only. Save a backup file
          now and then (email it to yourself or save to Google Drive) so nothing
          is ever lost.
        </p>
        <Button onClick={() => downloadBackup()}>💾 Save a backup file</Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-800">Restore from backup</h2>
        <p className="text-stone-600">
          Got a new phone, or need to undo a mistake? Load a backup file to bring
          everything back. This replaces what's currently in the app.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => onRestore(e.target.files?.[0])}
        />
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          📂 Choose a backup file
        </Button>
      </Card>

      {message && (
        <div className="rounded-2xl bg-amber-50 p-4 text-stone-700">
          {message}
        </div>
      )}

      <Card>
        <h2 className="text-lg font-bold text-stone-800">About</h2>
        <p className="mt-1 text-stone-600">
          Mother's Cakes — a simple helper for tracking cake orders, recipes,
          costs and profit. Works offline once installed.
        </p>
      </Card>
    </div>
  );
}
