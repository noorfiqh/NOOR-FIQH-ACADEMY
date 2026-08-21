'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Smartphone, CreditCard, Truck, ShieldCheck, Copy, Check, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AppStore } from '@/lib/store';
import { sendOrderNotificationEmail } from '@/lib/email-service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    titleBn?: string;
    price: number;
    type: 'course' | 'book' | 'live_class';
    purchaseType?: 'pdf' | 'hardcover' | 'full_access';
  };
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, item, onSuccess }: PaymentModalProps) {
  const { user, loginWithGoogle } = useAuth();
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card' | 'cod'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [createdOrderNum, setCreatedOrderNum] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const PAYMENT_NUMBERS = {
    bkash: '01855905185 (Personal / Send Money)',
    nagad: '01855905185 (Personal / Send Money)',
    rocket: '01855905185 (Personal / Send Money)',
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText('01855905185');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleQuickLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.error || 'গুগল লগইন সম্পন্ন করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'গুগল লগইন সমস্যা।');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const currentUserId = user?.uid || (guestEmail ? `guest_${guestEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : `guest_${Date.now()}`);
    const currentUserName = user?.name || guestName.trim() || 'শিক্ষার্থী';
    const currentUserEmail = user?.email || guestEmail.trim() || 'student@noorfiqh.com';
    const currentUserPhone = user?.phone || guestPhone.trim() || senderPhone.trim() || shippingPhone.trim();

    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম ও ইমেইল লিখুন অথবা গুগল দিয়ে ১-ক্লিকে লগইন করুন।');
      return;
    }

    if (method !== 'card' && method !== 'cod' && !trxId.trim()) {
      setErrorMessage('অনুগ্রহ করে পেমেন্ট করার পর ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    if (item.purchaseType === 'hardcover' && (!shippingAddress.trim() || !shippingPhone.trim())) {
      setErrorMessage('হার্ডকভার বই কুরিয়ারের জন্য সম্পূর্ণ ঠিকানা ও মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    setLoading(true);

    try {
      const order = AppStore.createOrder({
        userId: currentUserId,
        userName: shippingName || currentUserName,
        userEmail: currentUserEmail,
        userPhone: shippingPhone || currentUserPhone,
        itemType: item.type,
        itemId: item.id,
        itemTitle: item.titleBn || item.title,
        amount: item.price,
        purchaseType: item.purchaseType || 'full_access',
        paymentMethod: method,
        trxId: method === 'card' ? `CARD-${Date.now()}` : (method === 'cod' ? 'CASH-ON-DELIVERY' : trxId.trim()),
        paymentPhone: senderPhone || currentUserPhone,
        shippingAddress: item.purchaseType === 'hardcover' ? `${shippingName || currentUserName}, ${shippingPhone || currentUserPhone}, ${shippingAddress}` : undefined
      });

      // If user paid via Card or it's free, auto approve
      if (method === 'card' || item.price === 0) {
        AppStore.updateOrderStatus(order.id, 'approved');
      }

      // Send Form Submit email notification to Admin's email
      sendOrderNotificationEmail(order).catch(err => {
        console.warn('Background order email dispatch notice:', err);
      });

      setCreatedOrderNum(order.orderNumber);
      setCompleted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#ece8e0] max-h-[90vh] flex flex-col font-sans"
      >
        {/* Modal Header */}
        <div className="p-5 bg-[#112734] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#17A2B8]">
              নিরাপদ পেমেন্ট ও ভর্তি পোর্টাল
            </span>
            <h3 className="font-extrabold text-lg text-white">
              {item.titleBn || item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#112734] text-[#17A2B8]/80 hover:text-white hover:bg-[#112734] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {completed ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-[#17A2B8]/15 text-[#17A2B8] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={36} />
              </div>
              <h4 className="text-2xl font-extrabold text-[#112734]">জাযাকাল্লাহু খাইরান!</h4>
              <p className="text-sm text-[#5a524d] leading-relaxed max-w-sm mx-auto">
                আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে। অর্ডার আইডি: <strong className="text-slate-900 font-mono">{createdOrderNum}</strong>
              </p>
              <div className="bg-[#fdfcf9] border border-[#ece8e0] p-4 rounded-2xl text-xs text-[#5a524d] text-left space-y-1.5">
                <p className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <span>অর্ডারের বিস্তারিত তথ্য এডমিনের ইমেইলে স্বয়ংক্রিয়ভাবে প্রেরিত হয়েছে।</span>
                </p>
                <p>• <strong>ম্যানুয়াল ভেরিফিকেশন:</strong> ট্রানজেকশন যাচাইয়ের পর ১-২ ঘণ্টার মধ্যে আপনার ড্যাশবোর্ডে কোর্স বা কিতাব সম্পূর্ণ আনলক হবে।</p>
                <p>• যেকোনো জরুরি সহায়তায় হোয়াটসঅ্যাপে যোগাযোগ করুন: <strong>+8801855905185</strong></p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#112734] text-white font-bold rounded-xl hover:bg-[#23626F] transition-colors"
              >
                ড্যাশবোর্ডে ফিরে যান
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* User Identity / Quick Login Card */}
              {user ? (
                <div className="bg-[#17A2B8]/10 border border-[#17A2B8]/30 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#112734] text-white flex items-center justify-center font-bold text-xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#112734] flex items-center gap-1.5">
                        <span>{user.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">লগইনকৃত</span>
                      </div>
                      <div className="text-[11px] text-[#5a524d]">{user.email}</div>
                    </div>
                  </div>
                  <ShieldCheck size={20} className="text-[#23626F]" />
                </div>
              ) : (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#112734]">অর্ডারকারীর তথ্য (Firestore সংরক্ষিত)</span>
                    <button
                      type="button"
                      onClick={handleGoogleQuickLogin}
                      disabled={loading}
                      className="px-3 py-1.5 bg-white border border-[#ece8e0] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <LogIn size={13} />
                      <span>গুগল ১-ক্লিক লগইন</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="আপনার পূর্ণ নাম *"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#ece8e0] text-xs bg-white focus:outline-none focus:border-[#112734]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="আপনার ইমেইল অ্যাড্রেস *"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#ece8e0] text-xs bg-white focus:outline-none focus:border-[#112734]"
                    />
                    <input
                      type="tel"
                      placeholder="মোবাইল নম্বর"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#ece8e0] text-xs bg-white focus:outline-none focus:border-[#112734] sm:col-span-2"
                    />
                  </div>
                </div>
              )}

              {/* Item Summary Card */}
              <div className="bg-[#fdfcf9] p-4 rounded-2xl border border-[#ece8e0] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#8a817c] font-bold uppercase block">মোট প্রদেয় মূল্য</span>
                  <span className="text-2xl font-black text-[#112734]">৳{item.price}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#23626F] bg-[#17A2B8]/10 px-2.5 py-1 rounded-md font-bold uppercase">
                    {item.purchaseType === 'pdf' ? 'PDF সংস্করণ' : (item.purchaseType === 'hardcover' ? 'প্রিন্ট বই' : 'পূর্ণাঙ্গ কোর্স')}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-[#2c3e50] uppercase mb-2">
                  পেমেন্ট মাধ্যম বেছে নিন
                </label>
                <div className={`grid gap-2 ${item.purchaseType === 'hardcover' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                  <button
                    type="button"
                    onClick={() => setMethod('bkash')}
                    className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                      method === 'bkash'
                        ? 'border-pink-600 bg-pink-50 text-pink-700 ring-2 ring-pink-500/20'
                        : 'border-[#ece8e0] hover:bg-slate-50 text-[#5a524d]'
                    }`}
                  >
                    <span className="font-extrabold text-sm">বিকাশ</span>
                    <span className="text-[10px] opacity-70">Send Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('nagad')}
                    className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                      method === 'nagad'
                        ? 'border-orange-600 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                        : 'border-[#ece8e0] hover:bg-slate-50 text-[#5a524d]'
                    }`}
                  >
                    <span className="font-extrabold text-sm">নগদ</span>
                    <span className="text-[10px] opacity-70">Send Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('rocket')}
                    className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                      method === 'rocket'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                        : 'border-[#ece8e0] hover:bg-slate-50 text-[#5a524d]'
                    }`}
                  >
                    <span className="font-extrabold text-sm">রকেট</span>
                    <span className="text-[10px] opacity-70">Send Money</span>
                  </button>
                  
                  {item.purchaseType === 'hardcover' && (
                    <button
                      type="button"
                      onClick={() => setMethod('cod')}
                      className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                        method === 'cod'
                          ? 'border-[#17A2B8] bg-[#17A2B8]/10 text-[#112734] ring-2 ring-[#17A2B8]/500/20'
                          : 'border-[#ece8e0] hover:bg-slate-50 text-[#5a524d]'
                      }`}
                    >
                      <span className="font-extrabold text-sm text-center">ক্যাশঅন</span>
                      <span className="text-[10px] opacity-70 text-center">Cash On Delivery</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Instructions for Mobile Banking */}
              {(method === 'bkash' || method === 'nagad' || method === 'rocket') && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-[#5a524d]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 capitalize">{method} পার্সোনাল নম্বর:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(PAYMENT_NUMBERS[method])}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2.5 py-1 rounded-lg hover:bg-[#17A2B8]/20/80 transition-colors"
                    >
                      {copied ? <Check size={12} className="text-[#23626F]" /> : <Copy size={12} />}
                      <span>{copied ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-base font-black text-slate-900 bg-white p-2 rounded-xl border border-amber-200 text-center">
                    01855905185
                  </p>
                  <p className="text-[11px] text-amber-950">
                    * আপনার {method} অ্যাপ থেকে উপরোক্ত নম্বরে <strong>৳{item.price}</strong> সেন্ড মানি করুন। এরপর নিচে আপনার প্রেরক নম্বর ও ট্রানজেকশন আইডি (TrxID) লিখুন।
                  </p>
                </div>
              )}

              {/* Transaction Inputs */}
              {(method === 'bkash' || method === 'nagad' || method === 'rocket') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2c3e50] mb-1">
                      যে নম্বর থেকে পাঠিয়েছেন
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01XXXXXXXXX"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-sm focus:outline-none focus:border-[#112734] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2c3e50] mb-1">
                      ট্রানজেকশন আইডি (TrxID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9J82K3L4"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ece8e0] text-sm focus:outline-none focus:border-[#112734] font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Hardcover Shipping Address Info */}
              {item.purchaseType === 'hardcover' && (
                <div className="space-y-3 pt-3 border-t border-[#ece8e0]">
                  <h4 className="text-xs font-bold uppercase text-[#112734] flex items-center gap-1.5">
                    <Truck size={14} /> হোম ডেলিভারি ঠিকানা
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="মোবাইল নম্বর"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="পূর্ণাঙ্গ ঠিকানা: বাসা/রোড, থানা, জেলা"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#ece8e0] text-xs focus:outline-none focus:border-[#112734]"
                  />
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck size={18} className="text-[#17A2B8]" />
                <span>{loading ? 'প্রসেসিং হচ্ছে...' : 'অর্ডার নিশ্চিত করুন (Confirm Enrollment)'}</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
