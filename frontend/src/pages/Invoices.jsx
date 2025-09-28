import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const mobile = localStorage.getItem('mobile');
    if (mobile) {
      axios.get(`${API_URL}/invoices?mobile=${mobile}`)
        .then(res => setInvoices(res.data))
        .catch(err => console.error('Error fetching invoices', err));
    }
  }, []);

  const handlePayment = async (invoice) => {
    const razorpayOptions = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Key ID
      amount: invoice.amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Lean IVR MVP',
      description: `Payment for Invoice #${invoice.id}`,
      order_id: '', // Will be fetched from backend
      handler: async (response) => {
        try {
          const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            invoiceId: invoice.id,
            amount: invoice.amount
          });
          if (verifyRes.data.success) {
            alert('Payment successful');
            // Refresh invoices
            const mobile = localStorage.getItem('mobile');
            axios.get(`${API_URL}/invoices?mobile=${mobile}`).then(res => setInvoices(res.data));
          } else {
            alert('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error', error);
          alert('Payment verification failed');
        }
      },
      prefill: {
        name: 'Test User',
        email: 'test.user@example.com',
        contact: localStorage.getItem('mobile')
      },
    };

    try {
      const orderRes = await axios.post(`${API_URL}/payments/create`, { amount: invoice.amount, invoiceId: invoice.id });
      razorpayOptions.order_id = orderRes.data.id;
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    } catch (error) {
      console.error('Error creating Razorpay order', error);
      alert('Error creating Razorpay order');
    }
  };

  return (
    <div>
      <div className="card">
        <h3>Billing & Invoices</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.amount}</td>
                <td>{invoice.status}</td>
                <td>
                  {invoice.status === 'pending' && (
                    <button className="cta" onClick={() => handlePayment(invoice)}>Pay Now</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}