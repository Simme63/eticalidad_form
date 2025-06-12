import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import receiptTemplate from "../utils/PRUEBA.pdf"; //! test pdf

const STATUS_ORDER = ["approved", "pending", "paid"];
const STATUS_TRANSLATIONS = {
	pending: "Pendiente",
	approved: "Aprobado",
	paid: "Pagado",
};

// Softer border colors using lighter shades and opacity (Tailwind uses alpha in hex)
const STATUS_BORDER_CLASSES = {
	pending: "border-yellow-300",
	approved: "border-red-300",
	paid: "border-green-300",
};

export default function Overview() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [cif, setCif] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownload = async () => {
    if (!user || !user.email || !companyName || !cif || !address) {
      alert("Faltan datos de usuario para generar el PDF.");
      return;
    }
    const existingPdfBytes = await fetch(receiptTemplate).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    // Draw text with userData
    firstPage.drawText("Compañía:", {
      x: 50,
      y: height - 300,
      size: 14,
      font: boldFont,
      color: rgb(50 / 255, 50 / 255, 50 / 255),
    });

    firstPage.drawText(`${companyName}`, {
      x: 140,
      y: height - 300,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText("Correo electrónico:", {
      x: 50,
      y: height - 320,
      size: 14,
      font: boldFont,
      color: rgb(50 / 255, 50 / 255, 50 / 255),
    });

    firstPage.drawText(`${user.email}`, {
      x: 200,
      y: height - 320,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText("CIF:", {
      x: 50,
      y: height - 340,
      size: 14,
      font: boldFont,
      color: rgb(50 / 255, 50 / 255, 50 / 255),
    });

    firstPage.drawText(`${cif}`, {
      x: 140,
      y: height - 340,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
    firstPage.drawText("Dirección:", {
      x: 50,
      y: height - 360,
      size: 14,
      font: boldFont,
      color: rgb(50 / 255, 50 / 255, 50 / 255),
    });

    firstPage.drawText(`${address}`, {
      x: 140,
      y: height - 360,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });

    // 💾 Save and download the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `recibo-${user.email.split("@")[0]}.pdf`;
    link.click();
  };
  useEffect(() => {
    const getUserData = async () => {
      if (!user) return;
      const { data, error } = await supabase.from("profiles").select("*");
      const match = data.find((item) => item.email === user.email);
      if (match) {
        setCompanyName(match.company_name);
        setCif(match.cif);
        setAddress(match.address);
      } else {
        console.log("No matching email found.");
      }
      if (error) {
        console.log(error);
      }
    };
    getUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserAndRequests = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Build query
      let query = supabase.from("requests").select("*").order("submitted_at", {
        ascending: false,
      });
      query = query.eq("user_id", user.id);

      const { data, error } = await query;

      if (error) console.error("Error cargando solicitudes:", error);

      setRequests(data || []);
      setLoading(false);
    };

    fetchUserAndRequests();
  }, []);

  if (loading) return <div className="text-center mt-8">Cargando...</div>;
  if (!user) return <div className="text-center mt-8">Inicia sesión para ver tus solicitudes.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Resumen de solicitudes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Marca</th>
              <th className="p-2 border">N° Factura</th>
              <th className="p-2 border">N° Parte</th>
              <th className="p-2 border">Cantidad</th>
              <th className="p-2 border">Motivo</th>
              <th className="p-2 border">Estado</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No hay solicitudes.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td className="p-2 border">{req.brand}</td>
                  <td className="p-2 border">{req.delivery_note_or_invoice_number}</td>
                  <td className="p-2 border">{req.part_number}</td>
                  <td className="p-2 border">{req.quantity}</td>
                  <td className="p-2 border">{req.reason_for_return}</td>
                  <td className="p-2 border capitalize">{req.status || "pendiente"}</td>
                  <td className="p-2 border capitalize">
                    <button
                      type="button"
                      className="border-2 p-4 rounded-2xl bg-sky-600 text-white shadow-lg transition-all duration-150 hover:bg-white hover:text-sky-600 active:bg-sky-600 active:text-white"
                      onClick={handleDownload}>
                      Obtener Copia
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
