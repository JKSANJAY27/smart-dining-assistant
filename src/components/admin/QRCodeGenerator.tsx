"use client";

import { useState } from "react";
import { QrCode, Printer, Download, UtensilsCrossed, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function QRCodeGenerator() {
  const [tableId, setTableId] = useState<string>("1");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTableUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.host}/table/${tableId}`;
    }
    return `http://localhost:3000/table/${tableId}`;
  };

  const getQrUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=249-115-22&bgcolor=15-12-10&data=${encodeURIComponent(getTableUrl())}`;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Spice Garden - Table ${tableId} QR Card</title>
          <style>
            body {
              font-family: 'Outfit', 'Inter', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #0f0c0a;
              color: #ffffff;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .card {
              border: 3px solid #f97316;
              border-radius: 32px;
              padding: 40px;
              max-width: 400px;
              background: linear-gradient(135deg, #191411 0%, #0f0c0a 100%);
              box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-bottom: 24px;
            }
            .logo-icon {
              background: linear-gradient(135deg, #f97316, #e11d48);
              width: 44px;
              height: 44px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 24px;
            }
            .brand-name {
              font-size: 28px;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .table-badge {
              background-color: rgba(249, 115, 22, 0.1);
              border: 1px solid rgba(249, 115, 22, 0.3);
              color: #f97316;
              padding: 6px 16px;
              border-radius: 9999px;
              font-size: 16px;
              font-weight: 800;
              display: inline-block;
              margin-bottom: 30px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .qr-container {
              background-color: #0f0c0a;
              padding: 20px;
              border-radius: 24px;
              border: 1px solid rgba(255,255,255,0.06);
              display: inline-block;
              margin-bottom: 30px;
            }
            .qr-image {
              display: block;
              width: 240px;
              height: 240px;
              border-radius: 12px;
            }
            .instructions {
              font-size: 16px;
              color: #b3b3b3;
              line-height: 1.6;
              margin-bottom: 12px;
            }
            .host-name {
              font-size: 12px;
              color: #f97316;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="logo-icon">🍽️</div>
              <div class="brand-name">Spice Garden</div>
            </div>
            
            <div class="table-badge">Table Seating ${tableId}</div>
            
            <div class="qr-container">
              <img class="qr-image" src="${getQrUrl()}" alt="Spice Garden Table ${tableId} QR" />
            </div>
            
            <div class="instructions">
              Scan to Join Group Table Cart & Order <br />
              <strong>Co-dine & chat with Zara AI Sommelier</strong>
            </div>
            
            <div class="host-name">✦ Powered by Zara AI ✦</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="glass-premium border border-white/5 rounded-3xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 no-min-size">
          <QrCode className="w-5.5 h-5.5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Generate Table QR Codes</h3>
          <p className="text-xs text-[hsl(220,10%,55%)]">
            Create and print seating cards so diners can scan to join the table.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Settings Box */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-[hsl(220,10%,50%)] tracking-wider">
              Enter Table Number
            </label>
            <input
              type="text"
              value={tableId}
              onChange={(e) => setTableId(e.target.value.replace(/\s+/g, ""))}
              placeholder="e.g. 5, 12, VIP-1"
              className="w-full text-xs text-white bg-[hsl(30,12%,10%)] border border-white/10 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 focus:shadow-[0_0_12px_rgba(249,115,22,0.2)] transition-all"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
              Resulting Target URL:
            </span>
            <code className="text-[10px] text-[hsl(220,10%,70%)] break-all select-all font-mono bg-black/40 p-1.5 rounded block border border-white/5">
              {getTableUrl()}
            </code>
          </div>

          <div className="flex gap-2.5">
            <Button
              onClick={handlePrint}
              className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black gap-2 select-none cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Table Card</span>
            </Button>
          </div>
        </div>

        {/* Live Card Preview Box */}
        <div className="flex flex-col items-center justify-center p-6 bg-[hsl(30,12%,10%)]/50 border border-white/5 rounded-3xl text-center space-y-4">
          <span className="text-[9px] font-extrabold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            Seating Card Preview
          </span>

          <div className="p-4 bg-[hsl(30,12%,10%)] border border-white/10 rounded-2xl inline-block shadow-md">
            {/* Standard Image QR rendering */}
            <img
              src={getQrUrl()}
              alt={`Table ${tableId} QR`}
              className="w-40 h-40 rounded-lg display-block"
              onLoad={() => setIsLoading(false)}
            />
          </div>

          <div>
            <h4 className="text-xs font-black text-white leading-none">Table Card Seat {tableId}</h4>
            <p className="text-[10px] text-[hsl(220,10%,55%)] mt-1.5 leading-relaxed">
              Place this card on the table physically. When customers scan it, they will join the shared table session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
