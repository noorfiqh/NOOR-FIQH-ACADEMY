import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetEmail, payload, orderNumber } = body;

    const emailToSend = (targetEmail || 'noorfiqhaca@gmail.com').trim();

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid payload provided for order notification' },
        { status: 400 }
      );
    }

    // Determine origin
    const host = req.headers.get('host') || 'noorfiqh.com';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const origin = req.headers.get('origin') || `${proto}://${host}`;
    const referer = req.headers.get('referer') || `${origin}/`;

    // Forward to FormSubmit.co via secure server-side POST with mandatory browser headers
    const formSubmitUrl = `https://formsubmit.co/ajax/${encodeURIComponent(emailToSend)}`;

    const formSubmitPayload = {
      ...payload,
      _template: payload._template || 'table',
      _captcha: 'false',
    };

    const response = await fetch(formSubmitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': origin,
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(formSubmitPayload),
    });

    const responseText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    // Check FormSubmit specific responses
    const isSuccess = data?.success === 'true' || data?.success === true || (response.ok && !data?.message?.toLowerCase().includes('activation'));
    const isActivationRequired = 
      data?.message?.toLowerCase().includes('activation') || 
      data?.message?.toLowerCase().includes('activate form');

    if (isActivationRequired) {
      return NextResponse.json({
        success: false,
        needsActivation: true,
        email: emailToSend,
        message: `FormSubmit থেকে ${emailToSend} ঠিকানায় একটি 'Activate Form' লিংক পাঠানো হয়েছে। অনুগ্রহ করে জিমেইল ইনবক্স বা স্প্যাম (Spam) ফোল্ডার চেক করে সেই লিংকে ক্লিক করে অ্যাক্টিভেট করুন।`,
        data,
      });
    }

    if (!isSuccess) {
      console.warn('FormSubmit returned error:', data);
      return NextResponse.json({
        success: false,
        error: data?.message || 'FormSubmit delivery error',
        data,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `নোটিফিকেশন সফলভাবে ${emailToSend} এ পাঠানো হয়েছে।`,
      orderNumber,
      data,
    });
  } catch (error: any) {
    console.error('Error in /api/notify-order:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error while sending notification' },
      { status: 500 }
    );
  }
}

