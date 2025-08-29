"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function Home() {
  const [attendance, setAttendance] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [denied, setDenied] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
    setupRealtime();
  }, []);

  const fetchData = async () => {
    let { data: att } = await supabase
      .from("attendance")
      .select("*")
      .order("id", { ascending: false });
    let { data: al } = await supabase
      .from("alerts")
      .select("*")
      .order("id", { ascending: false });
    let { data: dn } = await supabase
      .from("denied_access")
      .select("*")
      .order("id", { ascending: false });
    let { data: us } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: false });

    setAttendance(att || []);
    setAlerts(al || []);
    setDenied(dn || []);
    setUsers(us || []);
  };

  const setupRealtime = () => {
    supabase
      .channel("tables-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, (payload) =>
        setAttendance((prev) => [payload.new, ...prev])
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, (payload) =>
        setAlerts((prev) => [payload.new, ...prev])
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "denied_access" }, (payload) =>
        setDenied((prev) => [payload.new, ...prev])
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) =>
        setUsers((prev) => [payload.new, ...prev])
      )
      .subscribe();
  };

  // Table wrapper to avoid repeating styles
  const TableWrapper = ({ title, children }) => (
    <motion.div
      className="bg-white rounded-2xl shadow-md p-4 overflow-x-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-y-auto max-h-96">{children}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">🎯 RFID Access Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Users Table */}
        <TableWrapper title="👥 Users">
          <table className="w-full border border-gray-300 border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-2">Name</th>
                <th className="border border-gray-300 px-2 py-2">UID</th>
                <th className="border border-gray-300 px-2 py-2">Role</th>
                <th className="border border-gray-300 px-2 py-2">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1">{u.name}</td>
                  <td className="border border-gray-300 px-2 py-1">{u.card_uid}</td>
                  <td className="border border-gray-300 px-2 py-1">{u.role}</td>
                  <td className="border border-gray-300 px-2 py-1">{u.room_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>

        {/* Attendance Table */}
        <TableWrapper title="✅ Attendance">
          <table className="w-full border border-gray-300 border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-2">UID</th>
                <th className="border border-gray-300 px-2 py-2">Role</th>
                <th className="border border-gray-300 px-2 py-2">Check-In</th>
                <th className="border border-gray-300 px-2 py-2">Check-Out</th>
                <th className="border border-gray-300 px-2 py-2">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {attendance.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1">{a.card_uid}</td>
                  <td className="border border-gray-300 px-2 py-1">{a.role}</td>
                  <td className="border border-gray-300 px-2 py-1">{a.check_in}</td>
                  <td className="border border-gray-300 px-2 py-1">{a.check_out || "🟢 Inside"}</td>
                  <td className="border border-gray-300 px-2 py-1">{a.duration || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>

        {/* Alerts Table */}
        <TableWrapper title="⚠️ Alerts">
          <table className="w-full border border-gray-300 border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-2">Message</th>
                <th className="border border-gray-300 px-2 py-2">Triggered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {alerts.map((al, i) => (
                <tr key={i} className="hover:bg-yellow-50">
                  <td className="border border-gray-300 px-2 py-1">{al.alert_message}</td>
                  <td className="border border-gray-300 px-2 py-1">{al.triggered_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>

        {/* Denied Access Table */}
        <TableWrapper title="⛔ Denied Access">
          <table className="w-full border border-gray-300 border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-2 py-2">UID</th>
                <th className="border border-gray-300 px-2 py-2">Role</th>
                <th className="border border-gray-300 px-2 py-2">Reason</th>
                <th className="border border-gray-300 px-2 py-2">Attempted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {denied.map((dn, i) => (
                <tr key={i} className="hover:bg-red-50">
                  <td className="border border-gray-300 px-2 py-1">{dn.card_uid}</td>
                  <td className="border border-gray-300 px-2 py-1">{dn.role}</td>
                  <td className="border border-gray-300 px-2 py-1">{dn.denial_reason}</td>
                  <td className="border border-gray-300 px-2 py-1">{dn.attempted_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>

      </div>
    </div>
  );
}
