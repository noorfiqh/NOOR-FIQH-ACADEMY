import { Order, SiteSettings } from './types';
import { AppStore } from './store';

export interface FormSubmitPayload {
  [key: string]: string;
}

/**
 * Maps Order details to clean, human-readable Bengali fields for FormSubmit email table
 */
export function formatOrderForFormSubmit(order: Order, originUrl: string = ''): FormSubmitPayload {
  const itemTypeMap: Record<string, string> = {
    course: 'অনলাইন কোর্স (Course)',
    book: 'কিতাব ও প্রকাশনা (Book)',
    live_class: 'লাইভ মাস্টারক্লাস (Live Class)',
  };

  const purchaseTypeMap: Record<string, string> = {
    hardcover: 'মুদ্রিত হার্ডকভার বই (কুরিয়ার হোম ডেলিভারি)',
    pdf: 'ডিজিটাল সংস্করণ (PDF Download)',
    full_access: 'সম্পূর্ণ কোর্স এক্সেস ও লাইভ ক্লাস',
  };

  const paymentMethodMap: Record<string, string> = {
    bkash: 'বিকাশ (bKash Send Money)',
    nagad: 'নগদ (Nagad Send Money)',
    rocket: 'রকেট (Rocket Send Money)',
    card: 'অনলাইন কার্ড / গেটওয়ে',
    cod: 'ক্যাশ অন ডেলিভারি (COD)',
  };

  const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const adminLink = originUrl ? `${originUrl}/admin` : 'https://noorfiqh.com/admin';

  return {
    _subject: `[নতুন অর্ডার #${order.orderNumber}] ${order.itemTitle} - ${order.amount} ৳ (${order.userName || 'শিক্ষার্থী'})`,
    _template: 'table',
    _captcha: 'false',
    _replyto: order.userEmail || 'no-reply@noorfiqh.com',
    'অর্ডার নম্বর (Order ID)': order.orderNumber,
    'শিক্ষার্থী / ক্রেতার নাম': order.userName || 'নাম প্রদান করা হয়নি',
    'ইমেইল অ্যাড্রেস': order.userEmail || 'ইমেইল প্রদান করা হয়নি',
    'যোগাযোগ নম্বর (Phone)': order.userPhone || 'N/A',
    'আইটেম টাইপ': itemTypeMap[order.itemType] || order.itemType,
    'কোর্স / বইয়ের শিরোনাম': order.itemTitle,
    'ক্রয়ের ধরন (Format)': purchaseTypeMap[order.purchaseType || 'full_access'] || order.purchaseType || 'General',
    'টাকার পরিমাণ (Price)': `${order.amount} ৳ (BDT)`,
    'পেমেন্ট মেথড': paymentMethodMap[order.paymentMethod] || order.paymentMethod,
    'ট্রানজেকশন আইডি (TrxID)': order.trxId || 'N/A',
    'পেমেন্ট প্রেরক মোবাইল নম্বর': order.paymentPhone || 'N/A',
    'কুরিয়ার ডেলিভারি ঠিকানা': order.shippingAddress || 'ডিজিটাল এক্সেস (ঠিকানা প্রয়োজন নেই)',
    'অর্ডারের সময় (Dhaka Time)': dateFormatted,
    'অ্যাডমিন ড্যাশবোর্ড অনুমোদন লিংক': adminLink,
  };
}

/**
 * Sends order notification email to admin using FormSubmit / API route
 */
export async function sendOrderNotificationEmail(
  order: Order,
  customSettings?: SiteSettings
): Promise<{ success: boolean; needsActivation?: boolean; message: string }> {
  try {
    const settings = customSettings || AppStore.getSettings();

    // Check if notification is enabled
    if (settings.orderNotificationEnabled === false) {
      return { success: true, message: 'Email notifications are disabled by admin.' };
    }

    const targetEmail = (settings.orderNotificationEmail?.trim() || 'noorfiqhaca@gmail.com');
    const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const payload = formatOrderForFormSubmit(order, originUrl);

    const endpoint = settings.formSubmitEndpoint?.trim() || `/api/notify-order`;

    // 1. Send via internal Next.js API route
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          targetEmail,
          payload,
          orderNumber: order.orderNumber,
        }),
      });

      const resData = await response.json().catch(() => null);

      if (resData?.needsActivation) {
        return { 
          success: false, 
          needsActivation: true, 
          message: resData.message || `FormSubmit সক্রিয় করার জন্য ${targetEmail} এ কনফার্মেশন লিঙ্ক পাঠানো হয়েছে।` 
        };
      }

      if (resData?.success) {
        return { success: true, message: resData.message || 'অর্ডার নোটিফিকেশন ইমেইল সফলভাবে পাঠানো হয়েছে।' };
      }
    } catch (apiErr) {
      console.warn('API route notify-order call failed:', apiErr);
    }

    // 2. Direct FormSubmit.co Fallback
    const directUrl = `https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`;
    const directResponse = await fetch(directUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const directData = await directResponse.json().catch(() => null);
    if (directData?.success === 'true' || directData?.success === true) {
      return { success: true, message: 'FormSubmit এর মাধ্যমে নোটিফিকেশন পাঠানো হয়েছে।' };
    } else if (directData?.message?.includes('Activation')) {
      return { 
        success: false, 
        needsActivation: true, 
        message: `FormSubmit থেকে ${targetEmail} এ অ্যাক্টিভেশন লিঙ্ক পাঠানো হয়েছে। জিমেইল চেক করে 'Activate Form' এ ক্লিক করুন।` 
      };
    } else {
      return { success: false, message: directData?.message || 'ইমেইল প্রেরণ সম্পন্ন হতে পারেনি।' };
    }
  } catch (error: any) {
    console.error('Failed to send order notification email:', error);
    return { success: false, message: error?.message || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে।' };
  }
}

/**
 * Sends a test notification to verify admin's email configuration
 */
export async function sendTestNotificationEmail(
  targetEmail: string,
  customEndpoint?: string
): Promise<{ success: boolean; needsActivation?: boolean; message: string }> {
  try {
    const email = (targetEmail?.trim() || 'noorfiqhaca@gmail.com');
    const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const testPayload: FormSubmitPayload = {
      _subject: `[টেস্ট নোটিফিকেশন] নূর ফিকহ একাডেমি - ফর্ম সাবমিট সিস্টেম ভেরিফিকেশন`,
      _template: 'table',
      _captcha: 'false',
      _replyto: 'no-reply@noorfiqh.com',
      'টেস্ট স্ট্যাটাস': 'সফল (Success)',
      'বার্তার বিষয়': 'নূর ফিকহ একাডেমি অর্ডার ইমেইল নোটিফিকেশন টেস্ট',
      'প্রেরক সিস্টেম': 'Form Submit Automated System',
      'প্রাপ্তির ইমেইল': email,
      'পরীক্ষার সময় (Dhaka Time)': new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      'বিবরণ': 'আপনার ওয়েবসাইট থেকে কোনো শিক্ষার্থী নতুন কোর্স বা বই কিনলে এভাবেই স্বয়ংক্রিয়ভাবে সকল তথ্যসহ আপনার ইমেইলে নোটিফিকেশন পৌঁছে যাবে।',
      'অ্যাডমিন লিংক': originUrl ? `${originUrl}/admin` : 'https://noorfiqh.com/admin',
    };

    const endpoint = customEndpoint?.trim() || `/api/notify-order`;

    // Attempt via API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        targetEmail: email,
        payload: testPayload,
        orderNumber: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
      }),
    });

    const resData = await response.json().catch(() => null);

    if (resData?.needsActivation) {
      return {
        success: false,
        needsActivation: true,
        message: resData.message || `FormSubmit থেকে ${email} ঠিকানায় 'Activate Form' লিঙ্ক পাঠানো হয়েছে।`,
      };
    }

    if (resData?.success) {
      return {
        success: true,
        message: resData.message || `টেস্ট ইমেইলটি সফলভাবে ${email} এ পাঠানো হয়েছে! ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`,
      };
    }

    if (resData?.error) {
      return {
        success: false,
        message: resData.error,
      };
    }

    // Direct FormSubmit fallback
    const directUrl = `https://formsubmit.co/ajax/${encodeURIComponent(email)}`;
    const directResponse = await fetch(directUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const directData = await directResponse.json().catch(() => null);
    if (directData?.success === 'true' || directData?.success === true) {
      return { success: true, message: `টেস্ট ইমেইলটি সফলভাবে ${email} এ পৌঁছেছে!` };
    } else if (directData?.message?.includes('Activation')) {
      return {
        success: false,
        needsActivation: true,
        message: `FormSubmit সক্রিয় করতে ${email} এর জিমেইল ইনবক্স/স্প্যাম ফোল্ডারে পাঠানো 'Activate Form' লিংকে একবার ক্লিক করুন।`,
      };
    } else {
      return { success: false, message: directData?.message || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে।' };
    }
  } catch (error: any) {
    return { success: false, message: error?.message || 'টেস্ট ইমেইল পাঠাতে ব্যর্থ হয়েছে।' };
  }
}
