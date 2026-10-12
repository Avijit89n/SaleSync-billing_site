import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Download,
  Printer,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Clock,
  ReceiptText,
  Wallet,
  CheckCircle2,
  CircleDollarSign,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axios/interceptor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Loader2 from '@/components/loaders/loader2';
import { Badge } from '@/components/ui/badge';
import { pdf } from '@react-pdf/renderer';
import InvoiceDesign1 from '@/components/other-ui/invoice-design-1';
import InvoiceDesign2 from '@/components/other-ui/invoice-design-2';
import InvoiceDesign3 from '@/components/other-ui/invoice-design-3';
import InvoiceDesign4 from '@/components/other-ui/invoice-design-4';
import ThermalInvoice1 from '@/components/other-ui/thermal-design-1';
import ThermalInvoice2 from '@/components/other-ui/thermal-design-2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DatePickerInput } from '@/components/other-ui/date-picker-input';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getDisplayStatus = (status, dueDate) => {
  let displayStatus = status;
  if (status?.toLowerCase() === 'cancel') {
    displayStatus = 'Void';
  } else if (status !== 'Paid' && dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    if (today > due) {
      displayStatus = 'Overdue';
    }
  }
  return displayStatus;
};

// Helper function to extract repeated calculation logic
const getRowAmount = (data) => (data.quantity * data.itemSellingPrice) - (data.itemDiscountAmount || 0);

const StatusBadge = ({ status, dueDate }) => {
  const { t } = useTranslation(); // Fix: Added missing useTranslation
  const displayStatus = getDisplayStatus(status, dueDate);
  
  const statusConfig = {
    Paid: {
      label: t('CheckInvoice.paidInFull'),
      icon: CheckCircle2,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    'Partially Paid': {
      label: t('CheckInvoice.partiallyPaid'),
      icon: CircleDollarSign,
      className: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    Overdue: {
      label: t('CheckInvoice.overdue'),
      icon: Clock,
      className: 'bg-red-50 text-red-600 border-red-200'
    },
    Void: {
      label: t('CheckInvoice.void'),
      icon: ReceiptText,
      className: 'bg-slate-100 text-slate-600 border-slate-200' // Fix: Corrected invalid text-slate-600-2 class
    },
    default: {
      label: t('CheckInvoice.unpaid'),
      icon: Clock,
      className: 'bg-orange-50 text-orange-600 border-orange-200'
    }
  };

  const config = statusConfig[displayStatus] || statusConfig.default;
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.className} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-none pointer-events-none`}
    >
      <Icon size={11} />
      {config.label}
    </Badge>
  );
};

const InfoRow = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-2.5 text-sm text-slate-500">
    <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
    <span className="min-w-0 break-words leading-relaxed">{children}</span>
  </div>
);

const SectionHeading = ({ icon: Icon, title, description }) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          <Icon size={15} />
        </div>
      )}
      <div>
        <h2 className="text-sm font-bold tracking-tight text-slate-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>
        )}
      </div>
    </div>
  </div>
);

// Reusable UI Action Button to DRY up code
const ActionButton = ({ onClick, icon: Icon, children }) => (
  <Button
    onClick={onClick}
    variant="outline"
    className="h-9 rounded-lg border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-none hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
  >
    <Icon size={14} className="mr-2" />
    {children}
  </Button>
);

const initialData = {
  companyName: '',
  gstin: '',
  phone: '',
  email: '',
  address: '',
  logo: null,
  signature: null,
  a4Layout: 'invoiceDesign1',
  thermalLayout: 'thermalDesign1'
};

export default function CheckInvoice() {
  const { t } = useTranslation(); // Fix: Added missing useTranslation to avoid ReferenceError
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(initialData);
  const [fetchLoading, setFetchLoading] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'Cash',
    date: new Date(),
    note: ''
  });

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/invoice/get-invoice/${id}`);
      if (res.data?.success) {
        setInvoiceData(res.data.data);
      } else {
        toast.error(t('CheckInvoice.failedLoadDetails'));
        navigate('/user/all-invoices');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('CheckInvoice.failedLoadInvoice'));
      navigate('/user/all-invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceSettings = async () => {
    setFetchLoading(true);
    try {
      const res = await api.get('/invoice-customizer/get-invoice-settings');
      const data = res?.data?.data || {};
      setCompanyInfo({
        companyName: data.companyName || '',
        gstin: data.companyGSTIN || '',
        phone: data.companyPhone || '',
        email: data.companyEmail || '',
        address: data.companyAddress || '',
        a4Layout: data.companyA4LayoutId || 'invoiceDesign1',
        thermalLayout: data.companyThermalLayoutId || 'thermalDesign1',
        logo: data.companyLogo || null,
        signature: data.companySignature || null
      });
    } catch (err) {
      console.log(err);
      setCompanyInfo(initialData);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  useEffect(() => {
    fetchInvoiceSettings();
  }, []);

  const handleOpenPaymentModal = () => {
    if (!invoiceData) return;
    setPaymentForm({
      amount: invoiceData.balanceAmount.toString(),
      method: 'Cash',
      date: new Date(),
      note: ''
    });
    setIsPaymentModalOpen(true);
  };

  const submitPayment = async () => {
    const payAmount = Number(paymentForm.amount);
    if (payAmount <= 0) {
      return toast.error(t('CheckInvoice.paymentMustPositive'));
    }
    if (payAmount > invoiceData.balanceAmount) {
      return toast.error(t('CheckInvoice.cannotExceedBalance', { amount: formatCurrency(invoiceData.balanceAmount) }));
    }
    try {
      setSubmittingPayment(true);
      const payload = {
        amount: payAmount,
        paymentMethod: paymentForm.method,
        paymentDate: paymentForm.date.toISOString(),
        note: paymentForm.note.trim()
      };
      const res = await api.post(`/invoice/${id}/payment`, payload);
      if (res.data?.success) {
        toast.success(t('CheckInvoice.paymentRecorded'));
        setIsPaymentModalOpen(false);
        fetchInvoice();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('CheckInvoice.failedRecordPayment'));
    } finally {
      setSubmittingPayment(false);
    }
  };

  const renderInvoiceDocument = (isPreview = false, type) => {
    const invoiceInfo = {
      invoiceNumberSequence: invoiceData?.invoiceNumber,
      isPaid: invoiceData?.status === 'Paid',
      paymentStatus: invoiceData?.status,
      paidAmount: invoiceData?.paidAmount,
      balanceAmount: invoiceData?.balanceAmount,
      payments: invoiceData?.payments || [],
      selectedCustomer: {
        displayName: invoiceData?.customerName,
        workingPhone: invoiceData?.customerPhone,
        email: invoiceData?.customerEmail,
        billingAddress: invoiceData?.customerBillingAddress
      },
      itemData: invoiceData?.invoiceItems || [],
      subtotal: invoiceData?.subtotal,
      totalDiscount: invoiceData?.discount,
      taxedAmount: invoiceData?.tax,
      grandTotal: invoiceData?.grandTotal,
      notes: invoiceData?.notes,
      terms: invoiceData?.terms,
      issueDate: invoiceData?.invoiceDate ? formatDate(invoiceData.invoiceDate) : 'N/A',
      dueDate: invoiceData?.dueDate ? formatDate(invoiceData.dueDate) : 'N/A',
      isPreview,
      companyInfo,
      companyLogo: companyInfo?.logo || '',
      companySignature: companyInfo?.signature || ''
    };

    if (type === 'Thermal') {
      switch (companyInfo?.thermalLayout) {
        case 'thermalDesign2':
          return <ThermalInvoice2 {...invoiceInfo} />;
        default:
          return <ThermalInvoice1 {...invoiceInfo} />;
      }
    }
    switch (companyInfo?.a4Layout) {
      case 'invoiceDesign2':
        return <InvoiceDesign2 {...invoiceInfo} />;
      case 'invoiceDesign3':
        return <InvoiceDesign3 {...invoiceInfo} />;
      case 'invoiceDesign4':
        return <InvoiceDesign4 {...invoiceInfo} />;
      default:
        return <InvoiceDesign1 {...invoiceInfo} />;
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await pdf(renderInvoiceDocument(false)).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoiceData?.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error(t('CheckInvoice.failedDownload'));
      throw err;
    }
  };

  const handlePrintPdf = async (type = 'Normal') => {
    const originalTitle = document.title;
    const invoiceNumber = invoiceData?.invoiceNumber || 'Invoice';
    try {
      const blob = await pdf(renderInvoiceDocument(false, type)).toBlob();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        const file = new File([blob], `${invoiceNumber}.pdf`, {
          type: 'application/pdf'
        });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: invoiceNumber,
              text: `Here is ${invoiceNumber}`
            });
            document.title = originalTitle;
            return;
          } catch (shareError) {
            if (shareError.name === 'AbortError' || shareError.message?.toLowerCase().includes('cancel')) {
              console.log('User cancelled the share sheet');
              document.title = originalTitle;
              return;
            }
            throw shareError;
          }
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 5000);
        toast.info(t('CheckInvoice.pdfDownloadedPrint'));
        document.title = originalTitle;
        return;
      }
      
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        const cleanup = () => {
          try {
            URL.revokeObjectURL(blobUrl);
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (err) {
            console.error(err);
          } finally {
            document.title = originalTitle;
          }
        };
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        iframe.contentWindow.onafterprint = cleanup;
        setTimeout(cleanup, 10000);
      };
    } catch (err) {
      document.title = originalTitle;
      console.error(err);
      toast.error(t('CheckInvoice.failedGeneratePDF'));
    }
  };

  // Reusable sub-components for displaying Items mapping cleanly
  const renderDesktopRow = (data, index) => (
    <div
      key={index}
      className="grid grid-cols-[minmax(0,1fr)_70px_110px_120px_120px] items-center border-b border-slate-100 px-4 py-4 last:border-0 hover:bg-orange-50/30 transition-colors lg:grid-cols-[minmax(0,1fr)_80px_120px_130px_140px] lg:px-6"
    >
      <div className="min-w-0 pr-3">
        <p className="truncate text-sm font-semibold text-slate-900" title={data.itemName}>
          {data.itemName}
        </p>
      </div>
      <div className="min-w-0 text-center whitespace-nowrap">
        <span className="text-sm font-semibold text-slate-700">{data.quantity}</span>
        <span className="ml-1 text-[10px] text-slate-400">{data.itemUnit || 'pcs'}</span>
      </div>
      <div className="min-w-0 text-right font-mono text-xs text-slate-600 whitespace-nowrap">
        {formatCurrency(data.itemSellingPrice)}
      </div>
      <div className="min-w-0 text-right font-mono text-xs text-slate-400 whitespace-nowrap">
        {data.itemDiscountAmount > 0 ? `-${formatCurrency(data.itemDiscountAmount)}` : '—'}
      </div>
      <div className="min-w-0 text-right font-mono text-sm font-bold text-slate-900 whitespace-nowrap">
        {formatCurrency(getRowAmount(data))}
      </div>
    </div>
  );

  const renderMobileRow = (data, index) => (
    <div key={index} className="px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold leading-snug text-slate-900">{data.itemName}</p>
          <p className="mt-1 text-[11px] text-slate-400">
            {data.quantity} {data.itemUnit || 'pcs'} {' × '}
            {formatCurrency(data.itemSellingPrice)}
          </p>
        </div>
        <p className="shrink-0 whitespace-nowrap font-mono text-sm font-bold text-slate-900">
          {formatCurrency(getRowAmount(data))}
        </p>
      </div>
      {data.itemDiscountAmount > 0 && (
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{t('CheckInvoice.discount')}</span>
          <span className="font-mono font-medium text-orange-500">
            -{formatCurrency(data.itemDiscountAmount)}
          </span>
        </div>
      )}
    </div>
  );

  if (loading || fetchLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 />
      </div>
    );
  }

  if (!invoiceData) return null;

  const isVoid = invoiceData.status?.toLowerCase() === 'cancel';
  const canAddPayment = invoiceData.balanceAmount > 0 && !isVoid;

  return (
    <div className="animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans">
      <div className="space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-12 gap-4">
          <div className="flex w-full items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-orange-500" size={28} />
                {invoiceData.invoiceNumber}
                <StatusBadge status={invoiceData.status} dueDate={invoiceData.dueDate} />
              </h1>
              <p className="text-sm text-gray-500">{t('CheckInvoice.invoiceDetailsPaymentHistory')}</p>
            </div>
            <div className="items-center gap-2 flex-wrap flex">
              <ActionButton onClick={() => handlePrintPdf()} icon={Printer}>
                {t('CheckInvoice.print')}
              </ActionButton>
              
              <ActionButton onClick={() => handlePrintPdf('Thermal')} icon={Printer}>
                {t('CheckInvoice.thermalPrint')}
              </ActionButton>
              
              <ActionButton onClick={handleDownloadPdf} icon={Download}>
                {t('CheckInvoice.downloadPDF')}
              </ActionButton>

              {canAddPayment && (
                <Button
                  onClick={handleOpenPaymentModal}
                  className="h-9 rounded-lg bg-orange-500 px-4 text-xs font-bold text-white shadow-md shadow-orange-500/10 hover:bg-orange-600"
                >
                  <CreditCard size={14} className="mr-2" />
                  {t('CheckInvoice.recordPayment')}
                </Button>
              )}
            </div>
          </div>
        </div>
        <main>
          <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
            <div className="border-2 border-slate-200 bg-white rounded-xl">
              <div className="grid md:grid-cols-[1fr_220px]">
                <div className="p-5 md:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('CheckInvoice.billedTo')}</p>
                    <span className="text-[11px] font-mono text-slate-400">{invoiceData.invoiceNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-base font-bold text-orange-500">
                      {(invoiceData.customerName || 'N').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-slate-900">
                        {invoiceData.customerName || 'N/A'}
                      </h2>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <InfoRow icon={Mail}>{invoiceData.customerEmail || t('CheckInvoice.noEmail')}</InfoRow>
                    <InfoRow icon={Phone}>{invoiceData.customerPhone || t('CheckInvoice.noPhone')}</InfoRow>
                  </div>
                  <div className="mt-3">
                    <InfoRow icon={MapPin}>
                      {invoiceData.customerBillingAddress?.street1 ? (
                        <span>
                          {[
                            invoiceData.customerBillingAddress.street1,
                            invoiceData.customerBillingAddress.street2
                          ].filter(Boolean).join(', ')}
                          <br />
                          {[
                            invoiceData.customerBillingAddress.city,
                            invoiceData.customerBillingAddress.state,
                            invoiceData.customerBillingAddress.pincode
                          ].filter(Boolean).join(', ')}
                        </span>
                      ) : (
                        t('CheckInvoice.noAddress')
                      )}
                    </InfoRow>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50/40 p-5 md:border-l md:border-t-0 md:p-6">
                  <div className="grid grid-cols-2 gap-5 md:block md:space-y-7">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('CheckInvoice.issueDate')}</p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <CalendarDays size={14} className="text-orange-500" />
                        {formatDate(invoiceData.invoiceDate)}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('CheckInvoice.dueDate')}</p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Clock
                          size={14}
                          className={
                            getDisplayStatus(invoiceData.status, invoiceData.dueDate) === 'Overdue'
                              ? 'text-red-500'
                              : 'text-orange-500'
                          }
                        />
                        {formatDate(invoiceData.dueDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-orange-200 bg-orange-50 p-5 md:p-6">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-700/60">
                    {invoiceData.balanceAmount > 0 ? t('CheckInvoice.amountDue') : t('CheckInvoice.totalPaid')}
                  </p>
                  {invoiceData.balanceAmount === 0 && <CheckCircle2 size={18} className="text-emerald-500" />}
                </div>
                <div className="mt-3 truncate font-mono text-3xl font-bold tracking-tight md:text-4xl text-orange-600">
                  {formatCurrency(invoiceData.balanceAmount > 0 ? invoiceData.balanceAmount : invoiceData.grandTotal)}
                </div>
                <div className="mt-7 space-y-3 border-t border-orange-200/70 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t('CheckInvoice.totalBilled')}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatCurrency(invoiceData.grandTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t('CheckInvoice.amountPaid')}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatCurrency(invoiceData.paidAmount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border border-orange-200" />
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border-2 border-slate-200 bg-white">
            <div className="border-b-2 border-slate-200 px-5 py-4 md:px-6">
              <SectionHeading
                icon={ReceiptText}
                title={t('CheckInvoice.invoiceItems')}
                description={t('CheckInvoice.itemsCount', { count: invoiceData.invoiceItems?.length || 0 })}
              />
            </div>
            <div className="hidden md:block w-full overflow-x-auto">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[minmax(0,1fr)_70px_110px_120px_120px] items-center border-b border-slate-100 bg-slate-50/60 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_80px_120px_130px_140px] lg:px-6">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('CheckInvoice.product')}</span>
                  </div>
                  <div className="min-w-0 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('CheckInvoice.qty')}</span>
                  </div>
                  <div className="min-w-0 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('CheckInvoice.rate')}</span>
                  </div>
                  <div className="min-w-0 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('CheckInvoice.discount')}</span>
                  </div>
                  <div className="min-w-0 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('CheckInvoice.total')}</span>
                  </div>
                </div>
                {invoiceData.invoiceItems?.map(renderDesktopRow)}
              </div>
            </div>
            <div className="divide-y divide-slate-100 md:hidden">
              {invoiceData.invoiceItems?.map(renderMobileRow)}
            </div>
          </div>
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_350px]">
            <div className="space-y-6">
              {(invoiceData.notes || invoiceData.terms) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {invoiceData.notes && (
                    <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('CheckInvoice.notes')}</p>
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">
                        {invoiceData.notes}
                      </p>
                    </div>
                  )}
                  {invoiceData.terms && (
                    <div className="rounded-xl border-2 border-slate-200 bg-white p-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('CheckInvoice.terms')}</p>
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">
                        {invoiceData.terms}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="rounded-xl border-2 border-slate-200 bg-white p-5 md:p-6">
                <SectionHeading
                  icon={Wallet}
                  title={t('CheckInvoice.paymentHistory')}
                  description={t('CheckInvoice.recordedPayments')}
                />
                {invoiceData.payments?.length > 0 ? (
                  <div className="relative ml-2 border-l-2 border-slate-200">
                    {invoiceData.payments.map((pay, i) => (
                      <div key={pay._id || i} className="relative pb-6 pl-6 last:pb-1">
                        <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500 ring-1 ring-orange-200" />
                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-mono text-[15px] font-bold text-slate-900">
                                {formatCurrency(pay.amount)}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400">{formatDate(pay.paymentDate)}</p>
                            </div>
                            <Badge className="shrink-0 rounded-full border-2 border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 shadow-none">
                              {pay.paymentMethod}
                            </Badge>
                          </div>
                          {pay.note && (
                            <div className="mt-3 border-t-2 border-slate-200 pt-3">
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                <span className="font-semibold text-slate-400">{t('CheckInvoice.noteLabel')}</span> {pay.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed-2 border-slate-200 bg-slate-50/50 px-5 py-9 text-center">
                    <Wallet size={20} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium text-slate-500">{t('CheckInvoice.noPayments')}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:sticky lg:top-20">
              <div className="rounded-xl border-2 border-slate-200 bg-white p-5 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-slate-900">{t('CheckInvoice.invoiceSummary')}</h2>
                    <p className="mt-0.5 text-[11px] text-slate-400">{t('CheckInvoice.finalBreakdown')}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                    <ReceiptText size={15} />
                  </div>
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-slate-500">{t('CheckInvoice.subtotal')}</span>
                    <span className="font-mono font-medium text-slate-700">
                      {formatCurrency(invoiceData.subtotal)}
                    </span>
                  </div>
                  {invoiceData.discount > 0 && (
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-slate-500">{t('CheckInvoice.discount')}</span>
                      <span className="font-mono font-medium text-orange-500">
                        −{formatCurrency(invoiceData.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-[13px]">
                    <span className="text-slate-500">{t('CheckInvoice.taxAmount')}</span>
                    <span className="font-mono font-medium text-slate-700">
                      {formatCurrency(invoiceData.tax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5 pt-1">
                    <span className="text-sm font-bold text-slate-900">{t('CheckInvoice.grandTotal')}</span>
                    <span className="font-mono text-lg font-bold text-slate-900">
                      {formatCurrency(invoiceData.grandTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[13px]">
                    <span className="text-slate-500">{t('CheckInvoice.amountPaid')}</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatCurrency(invoiceData.paidAmount)}
                    </span>
                  </div>
                  <div className="mt-2 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600/60">
                          {t('CheckInvoice.balanceDue')}
                        </p>
                        <p className="mt-1 font-mono text-xl font-bold text-orange-600">
                          {formatCurrency(invoiceData.balanceAmount)}
                        </p>
                      </div>
                      {invoiceData.balanceAmount === 0 && (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      )}
                    </div>
                    {canAddPayment && (
                      <Button
                        onClick={handleOpenPaymentModal}
                        className="mt-3 h-11 w-full rounded-lg bg-orange-500 px-4 text-xs font-bold text-white shadow-md shadow-orange-500/10 hover:bg-orange-600"
                      >
                        <CreditCard size={15} className="mr-2" />
                        {t('CheckInvoice.recordPayment')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="w-[calc(100%-24px)] max-w-[430px] overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-0 shadow-2xl">
            <div className="border-b-2 border-slate-200 flex justify-start items-center gap-2 px-4 py-5 md:px-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <CreditCard size={16} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight text-slate-900">
                    {t('CheckInvoice.recordPayment')}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs leading-relaxed text-slate-400">
                    {t('CheckInvoice.paymentAgainst')}{' '}
                    <span className="font-mono font-bold text-slate-600">{invoiceData?.invoiceNumber}</span>
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="space-y-5 px-5 py-5 md:px-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t('CheckInvoice.paymentAmount')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-orange-500">
                    ₹
                  </span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={paymentForm.amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*\.?\d*$/.test(val)) {
                        setPaymentForm((p) => ({ ...p, amount: val }));
                      }
                    }}
                    onBlur={() => {
                      const num = Number(paymentForm.amount);
                      if (num > invoiceData?.balanceAmount) {
                        setPaymentForm((p) => ({ ...p, amount: invoiceData.balanceAmount.toString() }));
                        toast.info(t('CheckInvoice.amountCapped'));
                      }
                    }}
                    className="h-14 rounded-lg border border-slate-300 bg-white pl-9 font-mono text-xl font-bold text-slate-900 shadow-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div className="mt-2 flex justify-between text-[11px]">
                  <span className="text-slate-400">{t('CheckInvoice.remainingBalance')}</span>
                  <span className="font-mono font-semibold text-slate-600">
                    {formatCurrency(invoiceData?.balanceAmount)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t('CheckInvoice.method')}
                  </label>
                  <Select
                    value={paymentForm.method}
                    onValueChange={(val) => setPaymentForm((p) => ({ ...p, method: val }))}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-300 bg-white text-xs font-semibold shadow-none focus:ring-orange-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-slate-200 bg-white">
                      <SelectItem value="Cash">{t('CheckInvoice.cash')}</SelectItem>
                      <SelectItem value="UPI">{t('CheckInvoice.upi')}</SelectItem>
                      <SelectItem value="Bank Transfer">{t('CheckInvoice.bankTransfer')}</SelectItem>
                      <SelectItem value="Card">{t('CheckInvoice.card')}</SelectItem>
                      <SelectItem value="Cheque">{t('CheckInvoice.cheque')}</SelectItem>
                      <SelectItem value="Other">{t('CheckInvoice.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t('CheckInvoice.date')}
                  </label>
                  <DatePickerInput
                    value={paymentForm.date}
                    onChange={(date) => setPaymentForm((p) => ({ ...p, date }))}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Note <span className="font-normal normal-case tracking-normal text-slate-400">{t('CheckInvoice.optional')}</span>
                </label>
                <Textarea
                  placeholder={t('CheckInvoice.transactionPlaceholder')}
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))}
                  className="h-20 resize-none rounded-lg border-slate-300 bg-white text-xs shadow-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
            <div className="flex gap-2 border-t-2 border-slate-200 bg-slate-50/60 p-4 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="h-10 flex-1 rounded-lg border-slate-300 bg-white text-xs font-bold text-slate-600 shadow-none hover:border-slate-400 sm:flex-none"
              >
                {t('CheckInvoice.cancel')}
              </Button>
              <Button
                onClick={submitPayment}
                disabled={submittingPayment || !paymentForm.amount}
                className="h-10 flex-1 rounded-lg bg-orange-500 px-5 text-xs font-bold text-white shadow-md shadow-orange-500/10 hover:bg-orange-600 sm:flex-none"
              >
                {submittingPayment ? t('CheckInvoice.confirming') : t('CheckInvoice.confirmPayment')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}