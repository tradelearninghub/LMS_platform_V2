import { query } from "@/lib/db";
import { CouponsClient } from "./coupons-client";

export const metadata = { title: "Coupons & Referrals" };

export default async function AdminCouponsPage() {
  const coupons = await query(
    `SELECT c.*, cr.title AS course_title
     FROM coupons c
     LEFT JOIN courses cr ON c.course_id = cr.id
     ORDER BY c.created_at DESC`
  );

  const courses = await query("SELECT id, title FROM courses ORDER BY title ASC");

  return <CouponsClient initialCoupons={coupons} courses={courses} />;
}
