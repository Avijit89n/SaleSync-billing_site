import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPen } from 'lucide-react';
import api from "@/axios/interceptor";
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/loaders/loader2';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateCustomerReq } from '../../redux/features/customerSlice';
const countries = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore"
];
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
const initialCustomerData = {
  customerType: "Individual",
  customerName: "",
  companyName: "",
  displayName: "",
  workingPhone: "",
  email: "",
  mobile: "",
  addressSame: true,
  billingAddress: {
    attention: "",
    country: "India",
    street1: "",
    street2: "",
    city: "",
    state: "West Bengal",
    pincode: "",
    phone: "",
    fax: "",
  },
  shippingAddress: {
    attention: "",
    country: "India",
    street1: "",
    street2: "",
    city: "",
    state: "West Bengal",
    pincode: "",
    phone: "",
    fax: "",
  },
};
const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
const inputCls = "w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed";
function EditCustomer() {
  const { t } = useTranslation();
  const [customerData, setCustomerData] = useState(initialCustomerData);
  const [originalCustomerData, setOriginalCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const savedRef = useRef(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { customerLoading } = useSelector((state) => state.customer);
  const isAppLoading = isLoading || customerLoading;
  const hasUnsavedChanges =
    originalCustomerData !== null &&
    JSON.stringify(customerData) !== JSON.stringify(originalCustomerData);
  const confirmLeave = () => {
    if (!hasUnsavedChanges || savedRef.current) return true;
    return window.confirm(
      t("CustomerForm.UnsavedChanges.Message", {
        defaultValue:
          "You have unsaved customer information. Are you sure you want to leave this page? Your changes will be lost.",
      })
    );
  };
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      !savedRef.current &&
      !isAppLoading &&
      currentLocation.pathname !== nextLocation.pathname
  );
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (confirmLeave()) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, t]);
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges || savedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
  const handleCancel = () => {
    if (!confirmLeave()) return;
    savedRef.current = true;
    navigate("/user/customer");
  };
  const fetchCustomerData = async (customerId) => {
    savedRef.current = false;
    setOriginalCustomerData(null);
    setIsLoading(true);
    try {
      const res = await api.get(`/customer/customer-id/${customerId}`);
      if (res.status === 200) {
        setCustomerData(res.data.data);
        setOriginalCustomerData(JSON.parse(JSON.stringify(res.data.data)));
      } else {
        toast.error(t("CustomerForm.Edit.Errors.FetchFailed"));
      }
    } catch (err) {
      toast.error(t("CustomerForm.Edit.Errors.FetchFailed"));
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchCustomerData(id);
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const absolutePayload = {
      ...customerData,
      shippingAddress: customerData.addressSame
        ? { ...customerData.billingAddress }
        : { ...customerData.shippingAddress }
    };
    toast.promise(
      dispatch(updateCustomerReq(absolutePayload)).unwrap(),
      {
        loading: t("CustomerForm.Edit.Status.Updating"),
        success: (res) => {
          savedRef.current = true;
          navigate("/user/customer");
          return res?.message || t("CustomerForm.Edit.Toast.Success");
        },
        error: (err) => {
          return err?.message || t("CustomerForm.Edit.Errors.UpdateFailed");
        }
      }
    );
  };
  return isLoading ? (
    <div className='flex h-full justify-center items-center w-full'>
      <Loader />
    </div>
  ) : (
    <div className="animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans">
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-12 gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserPen className="text-orange-500" size={28} />{t("CustomerForm.Edit.Title")}
            </h1>
            <p className="text-sm text-gray-500">{t("CustomerForm.Edit.Subtitle")}</p>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{t("CustomerForm.Sections.PrimaryProfile")}</h2>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field className="space-y-1">
              <FieldLabel htmlFor="display-name" className={labelCls}>
                {t("CustomerForm.Fields.CustomerName")}<span className='text-orange-500'>*</span>
              </FieldLabel>
              <Input
                disabled={isAppLoading}
                value={customerData.displayName}
                onChange={(e) => setCustomerData({ ...customerData, displayName: e.target.value })}
                id="display-name"
                placeholder={t("CustomerForm.Placeholders.CustomerName")}
                className={inputCls}
                required
              />
            </Field>
            <Field className="space-y-1">
              <FieldLabel htmlFor="phone" className={labelCls}>
                {t("CustomerForm.Fields.WorkPhone")}<span className='text-orange-500'>*</span>
              </FieldLabel>
              <Input
                disabled={isAppLoading}
                type="text"
                value={customerData.workingPhone}
                onChange={(e) => setCustomerData({ ...customerData, workingPhone: e.target.value })}
                id="phone"
                placeholder={t("CustomerForm.Placeholders.WorkPhone")}
                className={inputCls}
                required
              />
            </Field>
          </FieldGroup>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field className="space-y-1">
              <FieldLabel htmlFor="email" className={labelCls}>{t("CustomerForm.Fields.EmailAddress")}</FieldLabel>
              <Input
                disabled={isAppLoading}
                value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                id="email"
                type="email"
                placeholder="client@domain.com"
                className={inputCls}
              />
            </Field>
          </FieldGroup>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4 border-t border-slate-200 bg-white">
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{t("CustomerForm.Sections.BillingAddress")}</h2>
            <div className="grid gap-4">
              <div className="space-y-1">
                <label htmlFor="country" className={labelCls}>{t("CustomerForm.Fields.CountryRegion")}</label>
                <Select
                  disabled={isAppLoading}
                  value={customerData?.billingAddress?.country}
                  onValueChange={(val) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, country: val } })}
                >
                  <SelectTrigger id="country" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={t("CustomerForm.Placeholders.Region")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 bg-white border border-slate-200">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="street1" className={labelCls}>{t("CustomerForm.Fields.Address1")}</label>
                <Textarea disabled={isAppLoading} id="street1" value={customerData?.billingAddress?.street1} onChange={(e) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, street1: e.target.value } })} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" placeholder={t("CustomerForm.Placeholders.Address1")} />
              </div>
              <div className="space-y-1">
                <label htmlFor="street2" className={labelCls}>{t("CustomerForm.Fields.Address2")}</label>
                <Textarea disabled={isAppLoading} id="street2" value={customerData?.billingAddress?.street2} onChange={(e) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, street2: e.target.value } })} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" placeholder={t("CustomerForm.Placeholders.Address2")} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="city" className={labelCls}>{t("CustomerForm.Fields.City")}</label>
                <Input disabled={isAppLoading} value={customerData?.billingAddress?.city} onChange={(e) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, city: e.target.value } })} id="city" placeholder={t("CustomerForm.Placeholders.City")} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label htmlFor="state" className={labelCls}>{t("CustomerForm.Fields.State")}</label>
                <Select
                  disabled={isAppLoading}
                  value={customerData?.billingAddress?.state}
                  onValueChange={(val) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, state: val } })}
                >
                  <SelectTrigger id="state" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={t("CustomerForm.Placeholders.State")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 bg-white border border-slate-200">
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor="pincode" className={labelCls}>{t("CustomerForm.Fields.Pincode")}</label>
                <Input disabled={isAppLoading} type="text" id="pincode" value={customerData?.billingAddress?.pincode} onChange={(e) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, pincode: e.target.value } })} placeholder={t("CustomerForm.Placeholders.Pincode")} className={`${inputCls} font-mono`} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="phonebillingaddress" className={labelCls}>{t("CustomerForm.Fields.AddressPhone")}</label>
                <Input disabled={isAppLoading} type="text" id="phonebillingaddress" value={customerData?.billingAddress?.phone} onChange={(e) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, phone: e.target.value } })} placeholder={t("CustomerForm.Placeholders.AddressPhone")} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label htmlFor="faxbillingaddress" className={labelCls}>{t("CustomerForm.Fields.Fax")}</label>
                <Input disabled={isAppLoading} type="text" id="faxbillingaddress" value={customerData?.billingAddress?.fax} onChange={(e) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, fax: e.target.value } })} placeholder={t("CustomerForm.Placeholders.Fax")} className={inputCls} />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{t("CustomerForm.Sections.ShippingAddress")}</h2>
            <Label className={`flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition-all duration-150 bg-white mb-6 ${isAppLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300 has-[[aria-checked=true]]:border-orange-500/40'}`}>
              <Checkbox
                disabled={isAppLoading}
                id="address-mirror-toggle"
                checked={customerData.addressSame}
                onCheckedChange={(checked) => setCustomerData({ ...customerData, addressSame: !!checked })}
                className="mt-0.5 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="grid gap-1 font-normal">
                <p className="text-sm font-semibold text-slate-900 leading-none">{t("CustomerForm.AddressSame.Title")}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t("CustomerForm.AddressSame.Description")}</p>
              </div>
            </Label>
            {!customerData.addressSame && (
              <div className="animate-fade-in-scale transition-all duration-300 space-y-6 bg-white pt-2">
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <label htmlFor="countryShippingAddress" className={labelCls}>{t("CustomerForm.Fields.CountryRegion")}</label>
                    <Select
                      disabled={isAppLoading}
                      value={customerData?.shippingAddress?.country}
                      onValueChange={(val) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, country: val } })}
                    >
                      <SelectTrigger id="countryShippingAddress" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <SelectValue placeholder={t("CustomerForm.Placeholders.Region")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 bg-white border border-slate-200">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="street1ShippingAddress" className={labelCls}>{t("CustomerForm.Fields.Address1")}</label>
                    <Textarea disabled={isAppLoading} id="street1ShippingAddress" value={customerData?.shippingAddress?.street1} onChange={(e) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, street1: e.target.value } })} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" placeholder={t("CustomerForm.Placeholders.ShippingAddress1")} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="street2ShippingAddress" className={labelCls}>{t("CustomerForm.Fields.Address2")}</label>
                    <Textarea disabled={isAppLoading} id="street2ShippingAddress" value={customerData?.shippingAddress?.street2} onChange={(e) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, street2: e.target.value } })} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed" placeholder={t("CustomerForm.Placeholders.ShippingAddress2")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="cityShippingAddress" className={labelCls}>{t("CustomerForm.Fields.City")}</label>
                    <Input disabled={isAppLoading} id="cityShippingAddress" value={customerData?.shippingAddress?.city} onChange={(e) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, city: e.target.value } })} placeholder={t("CustomerForm.Placeholders.City")} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="stateShippingAddress" className={labelCls}>{t("CustomerForm.Fields.State")}</label>
                    <Select
                      disabled={isAppLoading}
                      value={customerData?.shippingAddress?.state}
                      onValueChange={(val) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, state: val } })}
                    >
                      <SelectTrigger id="stateShippingAddress" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <SelectValue placeholder={t("CustomerForm.Placeholders.State")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 bg-white border border-slate-200">
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="pincodeShippingAddress" className={labelCls}>{t("CustomerForm.Fields.Pincode")}</label>
                    <Input disabled={isAppLoading} type="text" id="pincodeShippingAddress" value={customerData?.shippingAddress?.pincode} onChange={(e) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, pincode: e.target.value } })} placeholder={t("CustomerForm.Placeholders.Pincode")} className={`${inputCls} font-mono`} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="phoneShippingAddress" className={labelCls}>{t("CustomerForm.Fields.ShippingPhone")}</label>
                    <Input disabled={isAppLoading} type="text" id="phoneShippingAddress" value={customerData?.shippingAddress?.phone} onChange={(e) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, phone: e.target.value } })} placeholder={t("CustomerForm.Placeholders.ShippingPhone")} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="faxShippingAddress" className={labelCls}>{t("CustomerForm.Fields.ShippingFax")}</label>
                    <Input disabled={isAppLoading} type="text" id="faxShippingAddress" value={customerData?.shippingAddress?.fax} onChange={(e) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, fax: e.target.value } })} placeholder={t("CustomerForm.Placeholders.ShippingFax")} className={inputCls} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-3">
          <Button
            disabled={isAppLoading}
            type="button"
            variant="outline"
            className="border-slate-200 hover:border-slate-300 text-slate-600 bg-white text-sm h-10 px-5 font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCancel}
          >
            {t("CustomerForm.Actions.Cancel")}
          </Button>
          <Button
            disabled={isAppLoading}
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm h-10 px-6 rounded-xl transition-all shadow-md shadow-orange-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("CustomerForm.Edit.Actions.Save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default EditCustomer;
