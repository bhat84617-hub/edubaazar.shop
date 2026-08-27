import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isValidAdminSession } from "@/lib/admin-session";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("edubazar_admin_session")?.value;

  if (!isValidAdminSession(session)) {
    redirect("/admin/login");
  }

  const db = getDb();
  let orders: Record<string, unknown>[] = [];
  if (db) {
    const { data } = await db.from("orders").select("*").order("date", { ascending: false });
    orders = (data as Record<string, unknown>[]) || [];
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Admin Dashboard - Course Approval Workflow | EduBazar</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; color: #181d27; }
          .header { background: #181d27; color: #fff; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
          .header h1 { font-size: 24px; font-weight: 600; }
          .header nav { display: flex; gap: 16px; }
          .header nav a { color: #fff; text-decoration: none; font-size: 14px; }
          .container { max-width: 1400px; margin: 24px auto; padding: 0 20px; }
          .order-card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
          .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .order-id { background: #687975; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
          .order-status { padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-approved { background: #d4edda; color: #155724; }
          .status-rejected { background: #f8d7da; color: #721c24; }
          .customer-info { flex: 1; }
          .customer-name { font-size: 20px; font-weight: 600; margin: 4px 0; }
          .customer-email { font-size: 14px; color: #666; }
          .order-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
          .detail-item { background: #f8f9fa; padding: 16px; border-radius: 8px; }
          .detail-label { font-size: 13px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
          .detail-value { font-size: 16px; font-weight: 600; }
          .course-items { margin-bottom: 24px; }
          .course-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #181d27; }
          .course-list { display: flex; flex-direction: column; gap: 12px; }
          .course-item { display: flex; justify-content: space-between; padding: 12px; background: #f0f2f5; border-radius: 6px; }
          .course-name { font-weight: 500; }
          .course-price { font-weight: 600; color: #687975; }
          .actions-section { display: flex; gap: 16px; align-items: flex-end; }
          .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; }
          .btn-approve { background: #28a745; color: white; }
          .btn-approve:hover { background: #218838; }
          .btn-reject { background: #dc3545; color: white; }
          .btn-reject:hover { background: #c82333; }
          .btn-download { background: #687975; color: white; }
          .btn-download:hover { background: #5a6260; }
          .btn-secondary { background: #6c757d; color: white; }
          .btn-secondary:hover { background: #5a6268; }
          .btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .download-links { margin-top: 16px; }
          .download-section { background: #e9ecef; padding: 16px; border-radius: 8px; }
          .download-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; margin: 8px 0; border-radius: 6px; }
          .download-url-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
          .empty-state { text-align: center; padding: 60px; color: #666; }
          .empty-icon { font-size: 48px; margin-bottom: 20px; opacity: 0.5; }
          .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #687975; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .download-progress { margin-top: 8px; font-size: 13px; color: #666; }
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
          .modal-content { background: white; border-radius: 12px; padding: 32px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; }
          .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .modal-title { font-size: 20px; font-weight: 600; }
          .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
          .form-group { margin-bottom: 20px; }
          .form-label { display: block; margin-bottom: 8px; font-weight: 600; }
          .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
          .form-input:focus { outline: none; border-color: #687975; box-shadow: 0 0 0 2px rgba(104,121,117,0.2); }
          .btn-block { width: 100%; }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>EduBazar Admin - Course Approval</h1>
          <nav>
            <a href="/">View Store</a>
            <a href="/admin/seo">SEO Tools</a>
            <a href="/api/admin/logout">Logout</a>
          </nav>
        </div>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2>Pending Course Orders ({orders.filter(o => String(o.status || '').toLowerCase() === 'pending').length})</h2>
            <button className="btn btn-secondary" onclick="window.location.reload()">Refresh</button>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No orders found.</p>
            </div>
          ) : (
            orders.map((order) => {
              const status = String(order.status || "pending").toLowerCase();
              const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);

              return (
                <div key={String(order.order_id)} className="order-card">
                  <div className="order-header">
                    <div className="order-id">Order #{String(order.order_id)}</div>
                    <span className={`order-status status-${status}`}>
                      {status === 'approved' ? 'APPROVED' : status === 'pending' ? 'PENDING VERIFICATION' : 'REJECTED'}
                    </span>
                  </div>

                  <div className="customer-info">
                    <div className="customer-name">{String(order.name)}</div>
                    <div className="customer-email">{String(order.email)}</div>
                  </div>

                  <div className="order-details">
                    <div className="detail-item">
                      <div className="detail-label">Total Amount</div>
                      <div className="detail-value">₹{String(order.total)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Payment Method</div>
                      <div className="detail-value">UPI QR</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">UTR / Transaction ID</div>
                      <div className="detail-value">{String(order.utr || 'Not provided')}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Order Date</div>
                      <div className="detail-value">{new Date(String(order.date)).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="course-items">
                    <div className="course-title">Courses Purchased:</div>
                    <div className="course-list">
                      {items.map((item, index) => (
                        <div key={index} className="course-item">
                          <span className="course-name">{item.name || item.id}</span>
                          <span className="course-price">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {status === 'pending' && (
                    <div>
                      <h3 style={{ marginBottom: 16 }}>Verify & Approve Course Access</h3>
                      <div className="download-section">
                        <p style={{ marginBottom: 16, color: #666, fontSize: 14 }}>
                          Please enter/download links for each course below. Once approved, these links will be sent to the customer's email and made available in their dashboard.
                        </p>
                        {items.map((item, index) => (
                          <div key={index} className="download-item">
                            <span>{item.name || item.id}</span>
                            <input
                              type="text"
                              className="download-url-input"
                              placeholder="Enter download URL (e.g., https://drive.google.com/... or https://mediafire.com/...)"
                              value={item.downloadUrl || ""}
                              onChange={(e) => {
                                const updatedItems = [...items];
                                updatedItems[index] = { ...updatedItems[index], downloadUrl: e.target.value };
                              }}
                            />
                          </div>
                        ))}
                        {items.length > 0 && (
                          <div className="download-progress" style={{ marginTop: 12, padding: 12, background: #d4edda, borderRadius: 4, border: '1px solid #c3e6cb', color: '#155724' }}>
                            💡 Tip: You can get download links from your course hosting platform (Google Drive, MediaFire, etc.) and paste them here
                          </div>
                        )}
                      </div>

                      <div className="actions-section">
                        <button
                          className="btn btn-approve"
                          onclick={(e) => {
                            e.preventDefault();
                            // Collect download URLs from inputs
                            const downloadUrls = {};
                            items.forEach((item, index) => {
                              const input = document.querySelectorAll('.download-url-input')[index];
                              if (input) {
                                downloadUrls[item.id || item.name] = input.value.trim();
                              }
                            });

                            // Validate that all required fields are filled
                            const missingUrls = items.filter(item =>
                              !downloadUrls[item.id || item.name] || downloadUrls[item.id || item.name].trim() === ''
                            );

                            if (missingUrls.length > 0) {
                              alert('Please provide download URLs for all courses before approving.');
                              return;
                            }

                            // Call approval API
                            fetch(`/api/admin/orders/approve?orderId=${order.order_id}`, {
                              method: 'GET',
                              headers: {
                                'Content-Type': 'application/json'
                              }
                            })
                            .then(response => {
                              if (response.ok) {
                                // Show success and refresh
                                alert('Course approved successfully! Download links sent to customer.');
                                window.location.reload();
                              } else {
                                response.text().then(text => alert('Error approving order: ' + text));
                              }
                            })
                            .catch(error => alert('Network error: ' + error.message));
                          }}
                        >
                          ✅ YES - Approve & Send Download Links
                        </button>

                        <button
                          className="btn btn-reject"
                          onclick={(e) => {
                            e.preventDefault();
                            if (confirm('Are you sure you want to reject this order? Customer will NOT receive access.')) {
                              fetch(`/api/admin/orders/reject?orderId=${order.order_id}`, {
                                method: 'GET',
                                headers: {
                                  'Content-Type': 'application/json'
                                }
                              })
                              .then(response => {
                                if (response.ok) {
                                  alert('Order rejected.');
                                  window.location.reload();
                                } else {
                                  response.text().then(text => alert('Error rejecting order: ' + text));
                                }
                              })
                              .catch(error => alert('Network error: ' + error.message));
                            }
                          }}
                        >
                          ❌ NO - Reject Order
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'approved' && (
                    <div>
                      <div className="status-badge" style={{ background: '#d4edda', color: '#155724' }}>✓ APPROVED - Link Sent</div>
                      <div className="download-links" style={{ marginTop: 16 }}>
                        <h4 style={{ marginBottom: 12, color: '#181d27' }}>Download Links Sent:</h4>
                        {items.map((item, index) => (
                          <div key={index} style={{ marginBottom: 8, padding: 12, background: #f8f9fa, borderRadius: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span>{item.name || item.id}</span>
                              {item.downloadUrl ? (
                                <>
                                  <a
                                    href={item.downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-download btn-sm"
                                    style={{ padding: '8px 16px', fontSize: '13px' }}
                                  >
                                    ⬇️ Download
                                  </a>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator.clipboard.writeText(item.downloadUrl);
                                      alert('Download link copied to clipboard!');
                                    }}
                                    className="btn btn-secondary btn-sm"
                                    style={{ marginLeft: '8px', padding: '6px 12px', fontSize: '12px' }}
                                  >
                                    📋 Copy
                                  </button>
                                </>
                              ) : (
                                <span style={{ color: '#666', fontStyle: 'italic' }}>Link not provided</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {status === 'rejected' && (
                    <div>
                      <div className="status-badge" style={{ background: '#f8d7da', color: '#721c24' }}>✕ REJECTED</div>
                      <p style={{ marginTop: 12, color: '#721c24', fontStyle: 'italic' }}>
                        Order was rejected. Customer will not receive access to courses.
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </body>
    </html>
  );
}
