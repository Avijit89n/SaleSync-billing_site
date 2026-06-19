import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleQuestionMark, UserPlus, ArrowLeft } from 'lucide-react';

// UI components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Redux feature slice
import { addCustomerReq } from '@/redux/features/customerSlice';

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

// Precise high-contrast typographical settings matching the Invoice final configuration
const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
const inputCls = "w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium";

function AddCustomer() {
    const [customerData, setCustomerData] = useState(initialCustomerData);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const absolutePayload = {
            ...customerData,
            shippingAddress: customerData.addressSame 
                ? { ...customerData.billingAddress } 
                : { ...customerData.shippingAddress }
        };

        toast.promise(
            dispatch(addCustomerReq(absolutePayload)).unwrap(),
            {
                loading: "Registering new record...",
                success: (res) => {
                    setCustomerData(initialCustomerData);
                    navigate("/user/customer");
                    return res?.message || "Customer directory file added successfully";
                },
                error: (err) => {
                    return err.message || "Something went wrong while executing query";
                }
            }
        );
    };

    return (
        <div className="opacity-0 animate-fade-in-scale transition-all duration-500 bg-white min-h-screen text-slate-900 antialiased px-6 py-4 md:px-12 md:py-6 font-sans">
            <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-12 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <UserPlus className="text-orange-500" size={28} /> Add New Customer
                        </h1>
                        <p className="text-sm text-gray-500">Create and configure client ledger indices, communication endpoints, and billing targets.</p>
                    </div>
                </div>

                {/* ── Section 1: Primary Profile Dossier Details ── */}
                <div className="space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                        Primary Profile Details
                    </h2>
                    
                    <FieldGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Field className="space-y-1">
                            <FieldLabel htmlFor="customer-type" className={labelCls}>
                                Customer Type
                            </FieldLabel>
                            <Select 
                                value={customerData.customerType} 
                                onValueChange={value => setCustomerData({ ...customerData, customerType: value })}
                            >
                                <SelectTrigger id="customer-type" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                                    <SelectValue placeholder="Select classification" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-slate-200">
                                    <SelectItem value="Individual">Individual</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                </SelectContent>  
                            </Select>
                        </Field>

                        <Field className="space-y-1">
                            <FieldLabel htmlFor="customer-name" className={labelCls}>Customer Name</FieldLabel>
                            <Input 
                                value={customerData.customerName} 
                                onChange={(e) => setCustomerData({ ...customerData, customerName: e.target.value })}
                                id="customer-name" 
                                placeholder="e.g. Avijit Biswas" 
                                className={inputCls}
                            />
                        </Field>

                        <Field className="space-y-1">
                            <FieldLabel htmlFor="company-name" className={labelCls}>Company Name</FieldLabel>
                            <Input 
                                value={customerData.companyName} 
                                onChange={(e) => setCustomerData({ ...customerData, companyName: e.target.value })}
                                id="company-name" 
                                placeholder="e.g. abc" 
                                className={inputCls}
                            />
                        </Field>
                    </FieldGroup>

                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field className="space-y-1">
                            <FieldLabel htmlFor="display-name" className={labelCls}>
                                Customer Display Name <span className='text-orange-500'>*</span>
                            </FieldLabel>
                            <Input 
                                value={customerData.displayName} 
                                onChange={(e) => setCustomerData({ ...customerData, displayName: e.target.value })}
                                id="display-name" 
                                placeholder="Public system billing alias name" 
                                className={inputCls}
                                required 
                            />
                        </Field>

                        <Field className="space-y-1">
                            <FieldLabel htmlFor="phone" className={labelCls}>
                                Work Phone <span className='text-orange-500'>*</span>
                            </FieldLabel>
                            <Input 
                                type="text" 
                                value={customerData.workingPhone} 
                                onChange={(e) => setCustomerData({ ...customerData, workingPhone: e.target.value })}
                                id="phone" 
                                placeholder="Primary office landline or desk number" 
                                className={inputCls}
                                required 
                            />
                        </Field>
                    </FieldGroup>

                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field className="space-y-1">
                            <FieldLabel htmlFor="email" className={labelCls}>Email Address</FieldLabel>
                            <Input 
                                value={customerData.email} 
                                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                id="email" 
                                type="email" 
                                placeholder="client@domain.com" 
                                className={inputCls}
                            />
                        </Field>

                        <Field className="space-y-1">
                            <FieldLabel htmlFor="Mobile" className={labelCls}>Mobile Number</FieldLabel>
                            <Input 
                                type="text" 
                                value={customerData.mobile} 
                                onChange={(e) => setCustomerData({ ...customerData, mobile: e.target.value })}
                                id="Mobile" 
                                placeholder="Personal communication cell number" 
                                className={inputCls}
                            />
                        </Field>
                    </FieldGroup>
                </div>

                {/* ── Section 2: Address Space Split Columns ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4 border-t border-slate-200 bg-white">
                    
                    {/* BILLING ADDRESS SPECIFICATION BLOCK */}
                    <div className="space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                            Billing Address
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="attention" className={labelCls}>Attention Counterpart</label>
                                <Input value={customerData?.billingAddress?.attention} onChange={(e) => setCustomerData({...customerData, billingAddress: {...customerData.billingAddress, attention: e.target.value}})} id="attention" placeholder="e.g. Accounts Dept." className={inputCls} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="country" className={labelCls}>Country/Region</label>
                                <Select
                                    value={customerData?.billingAddress?.country}
                                    onValueChange={(val) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, country: val } })}
                                >
                                    <SelectTrigger id="country" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                                        <SelectValue placeholder="Region" />
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
                                <label htmlFor="street1" className={labelCls}>Street Address 1</label>
                                <Textarea id="street1" value={customerData?.billingAddress?.street1} onChange={(e) => setCustomerData({...customerData, billingAddress: {...customerData.billingAddress, street1: e.target.value}})} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none" placeholder="Plot line, building details, sector..." />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="street2" className={labelCls}>Street Address 2</label>
                                <Textarea id="street2" value={customerData?.billingAddress?.street2} onChange={(e) => setCustomerData({...customerData, billingAddress: {...customerData.billingAddress, street2: e.target.value}})} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none" placeholder="Appartment unit, landmark, locality..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="city" className={labelCls}>City</label>
                                <Input value={customerData?.billingAddress?.city} onChange={(e) => setCustomerData({...customerData, billingAddress: {...customerData.billingAddress, city: e.target.value}})} id="city" placeholder="Kolkata" className={inputCls} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="state" className={labelCls}>State</label>
                                <Select
                                    value={customerData?.billingAddress?.state}
                                    onValueChange={(val) => setCustomerData({ ...customerData, billingAddress: { ...customerData.billingAddress, state: val } })}
                                >
                                    <SelectTrigger id="state" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                                        <SelectValue placeholder="State" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 bg-white border border-slate-200">
                                        {indianStates.map((state) => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="pincode" className={labelCls}>Pincode</label>
                                <Input type="text" id="pincode" value={customerData?.billingAddress?.pincode} onChange={(e) => setCustomerData({...customerData, billingAddress: {...customerData.billingAddress, pincode: e.target.value}})} placeholder="700001" className={`${inputCls} font-mono`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="phonebillingaddress" className={labelCls}>Address Phone</label>
                                <Input type="text" id="phonebillingaddress" value={customerData?.billingAddress?.phone} onChange={(e)=> setCustomerData({...customerData, billingAddress: {...customerData.billingAddress, phone: e.target.value}})} placeholder="Local contact reference" className={inputCls} />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="faxbillingaddress" className={labelCls}>Fax Gateway</label>
                                <Input type="text" id="faxbillingaddress" value={customerData?.billingAddress?.fax} onChange={(e)=>setCustomerData({...customerData, billingAddress: {...customerData.billingAddress, fax: e.target.value}})} placeholder="Fax routing matrix" className={inputCls} />
                            </div>
                        </div>
                    </div>

                    {/* SHIPPING ADDRESS SPECIFICATION BLOCK */}
                    <div className="space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                            Shipping Logistics Address
                        </h2>
                        
                        <Label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition-all duration-150 cursor-pointer bg-white hover:border-slate-300 has-[[aria-checked=true]]:border-orange-500/40 mb-6">
                            <Checkbox
                                id="address-mirror-toggle"
                                checked={customerData.addressSame}
                                onCheckedChange={(checked) => setCustomerData({ ...customerData, addressSame: !!checked })}
                                className="mt-0.5 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                            />
                            <div className="grid gap-1 font-normal">
                                <p className="text-sm font-semibold text-slate-900 leading-none">
                                    Mirror Billing Address Destinations
                                </p>
                                <p className="text-slate-400 text-xs mt-0.5">
                                    Automatically map inventory routing and dispatch nodes to match client billing lines.
                                </p>
                            </div>
                        </Label>

                        {!customerData.addressSame && (
                            <div className="animate-fade-in-scale opacity-0 transition-all duration-300 space-y-6 bg-white pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="attentionShippingAddress" className={labelCls}>Attention Target</label>
                                        <Input id="attentionShippingAddress" value={customerData?.shippingAddress?.attention} onChange={(e) => setCustomerData({...customerData, shippingAddress: {...customerData.shippingAddress, attention: e.target.value}})} placeholder="e.g. Receiving Bay 2" className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="countryShippingAddress" className={labelCls}>Country/Region</label>
                                        <Select
                                            value={customerData?.shippingAddress?.country}
                                            onValueChange={(val) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, country: val } })}
                                        >
                                            <SelectTrigger id="countryShippingAddress" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                                                <SelectValue placeholder="Region" />
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
                                        <label htmlFor="street1ShippingAddress" className={labelCls}>Street Address 1</label>
                                        <Textarea id="street1ShippingAddress" value={customerData?.shippingAddress?.street1} onChange={(e) => setCustomerData({...customerData, shippingAddress: {...customerData.shippingAddress, street1: e.target.value}})} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none" placeholder="Warehouse plot line..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="street2ShippingAddress" className={labelCls}>Street Address 2</label>
                                        <Textarea id="street2ShippingAddress" value={customerData?.shippingAddress?.street2} onChange={(e) => setCustomerData({...customerData, shippingAddress: {...customerData.shippingAddress, street2: e.target.value}})} className="w-full min-h-[90px] text-sm border border-slate-300 rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium placeholder-slate-400 resize-none" placeholder="Crossroad junction index..." />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="cityShippingAddress" className={labelCls}>City</label>
                                        <Input id="cityShippingAddress" value={customerData?.shippingAddress?.city} onChange={(e) => setCustomerData({...customerData, shippingAddress: {...customerData.shippingAddress, city: e.target.value}})} placeholder="City index" className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="stateShippingAddress" className={labelCls}>State</label>
                                        <Select
                                            value={customerData?.shippingAddress?.state}
                                            onValueChange={(val) => setCustomerData({ ...customerData, shippingAddress: { ...customerData.shippingAddress, state: val } })}
                                        >
                                            <SelectTrigger id="stateShippingAddress" className="w-full h-11 bg-white text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
                                                <SelectValue placeholder="State" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-64 bg-white border border-slate-200">
                                                {indianStates.map((state) => (
                                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="pincodeShippingAddress" className={labelCls}>Pincode</label>
                                        <Input type="text" id="pincodeShippingAddress" value={customerData?.shippingAddress?.pincode} onChange={(e) => setCustomerData({...customerData, shippingAddress: {...customerData.shippingAddress, pincode: e.target.value}})} placeholder="Zip index" className={`${inputCls} font-mono`} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="phoneShippingAddress" className={labelCls}>Logistics Phone</label>
                                        <Input type="text" id="phoneShippingAddress" value={customerData?.shippingAddress?.phone} onChange={(e) => setCustomerData({...customerData, shippingAddress: {...customerData.shippingAddress, phone: e.target.value}})} placeholder="Receiving post contact" className={inputCls} />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="faxShippingAddress" className={labelCls}>Logistics Fax</label>
                                        <Input type="text" id="faxShippingAddress" value={customerData?.shippingAddress?.fax} onChange={(e) => setCustomerData({...customerData, shippingAddress: {...customerData.shippingAddress, fax: e.target.value}})} placeholder="Terminal fax marker" className={inputCls} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Action Footer Console Bar ── */}
                <div className="pt-4 border-t border-slate-200 flex justify-end items-center gap-3">
                    <Button 
                        type="button"
                        variant="outline" 
                        className="border-slate-200 hover:border-slate-300 text-slate-600 bg-white text-sm h-10 px-5 font-bold rounded-xl transition-all shadow-sm"
                        onClick={() => {
                            setCustomerData(initialCustomerData); 
                            navigate("/user/customer");
                        }} 
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm h-10 px-6 rounded-xl transition-all shadow-md shadow-orange-600/10"
                    >
                        Save Record
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AddCustomer;