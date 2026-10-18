import type { SubNationalRegion } from '../types/registry';

interface CompactRegionSeed {
  code: string;
  countryIso2: string;
  name: string;
  nativeName?: string;
  type: SubNationalRegion['type'];
  capital: string;
  url: string;
  openDataUrl?: string;
  taxPortalName?: string;
  taxUrl?: string;
  transportName?: string;
  transportUrl?: string;
  businessName?: string;
  businessUrl?: string;
  judiciaryName?: string;
  judiciaryUrl?: string;
  customSummary?: string;
}

const US_STATES_SEED: CompactRegionSeed[] = [
  { code: 'US-AL', countryIso2: 'US', name: 'Alabama', type: 'State', capital: 'Montgomery', url: 'https://www.alabama.gov', taxUrl: 'https://www.revenue.alabama.gov', businessUrl: 'https://www.sos.alabama.gov' },
  { code: 'US-AK', countryIso2: 'US', name: 'Alaska', type: 'State', capital: 'Juneau', url: 'https://alaska.gov', taxUrl: 'https://tax.alaska.gov', openDataUrl: 'https://data.alaska.gov' },
  { code: 'US-AZ', countryIso2: 'US', name: 'Arizona', type: 'State', capital: 'Phoenix', url: 'https://az.gov', taxUrl: 'https://azdor.gov', transportUrl: 'https://azdot.gov/mvd' },
  { code: 'US-AR', countryIso2: 'US', name: 'Arkansas', type: 'State', capital: 'Little Rock', url: 'https://portal.arkansas.gov', taxUrl: 'https://atap.arkansas.gov', businessUrl: 'https://www.sos.arkansas.gov' },
  { code: 'US-CA', countryIso2: 'US', name: 'California', type: 'State', capital: 'Sacramento', url: 'https://www.ca.gov', openDataUrl: 'https://data.ca.gov', taxName: 'Franchise Tax Board (FTB) & CDTFA', taxUrl: 'https://www.ftb.ca.gov', transportName: 'California DMV', transportUrl: 'https://www.dmv.ca.gov', businessName: 'California Secretary of State bizfile', businessUrl: 'https://bizfileonline.sos.ca.gov' } as any,
  { code: 'US-CO', countryIso2: 'US', name: 'Colorado', type: 'State', capital: 'Denver', url: 'https://www.colorado.gov', openDataUrl: 'https://data.colorado.gov', taxUrl: 'https://tax.colorado.gov', transportUrl: 'https://dmv.colorado.gov' },
  { code: 'US-CT', countryIso2: 'US', name: 'Connecticut', type: 'State', capital: 'Hartford', url: 'https://portal.ct.gov', openDataUrl: 'https://data.ct.gov', taxUrl: 'https://portal.ct.gov/DRS' },
  { code: 'US-DE', countryIso2: 'US', name: 'Delaware', type: 'State', capital: 'Dover', url: 'https://delaware.gov', openDataUrl: 'https://data.delaware.gov', taxUrl: 'https://revenue.delaware.gov', businessUrl: 'https://corp.delaware.gov' },
  { code: 'US-DC', countryIso2: 'US', name: 'District of Columbia', type: 'Territory', capital: 'Washington, D.C.', url: 'https://dc.gov', openDataUrl: 'https://opendata.dc.gov', taxUrl: 'https://otr.cfo.dc.gov', transportUrl: 'https://dmv.dc.gov' },
  { code: 'US-FL', countryIso2: 'US', name: 'Florida', type: 'State', capital: 'Tallahassee', url: 'https://www.myflorida.com', taxUrl: 'https://floridarevenue.com', transportUrl: 'https://www.flhsmv.gov', businessUrl: 'https://dos.fl.gov/sunbiz/' },
  { code: 'US-GA', countryIso2: 'US', name: 'Georgia', type: 'State', capital: 'Atlanta', url: 'https://georgia.gov', taxUrl: 'https://dor.georgia.gov', transportUrl: 'https://dds.georgia.gov' },
  { code: 'US-HI', countryIso2: 'US', name: 'Hawaii', type: 'State', capital: 'Honolulu', url: 'https://portal.ehawaii.gov', openDataUrl: 'https://opendata.hawaii.gov', taxUrl: 'https://hitax.hawaii.gov' },
  { code: 'US-ID', countryIso2: 'US', name: 'Idaho', type: 'State', capital: 'Boise', url: 'https://www.idaho.gov', taxUrl: 'https://tax.idaho.gov', businessUrl: 'https://sosbiz.idaho.gov' },
  { code: 'US-IL', countryIso2: 'US', name: 'Illinois', type: 'State', capital: 'Springfield', url: 'https://www.illinois.gov', openDataUrl: 'https://data.illinois.gov', taxUrl: 'https://mytax.illinois.gov', businessUrl: 'https://www.ilsos.gov' },
  { code: 'US-IN', countryIso2: 'US', name: 'Indiana', type: 'State', capital: 'Indianapolis', url: 'https://www.in.gov', openDataUrl: 'https://hub.mph.in.gov', taxUrl: 'https://intime.dor.in.gov', transportUrl: 'https://www.in.gov/bmv/' },
  { code: 'US-IA', countryIso2: 'US', name: 'Iowa', type: 'State', capital: 'Des Moines', url: 'https://www.iowa.gov', openDataUrl: 'https://data.iowa.gov', taxUrl: 'https://tax.iowa.gov' },
  { code: 'US-KS', countryIso2: 'US', name: 'Kansas', type: 'State', capital: 'Topeka', url: 'https://www.kansas.gov', taxUrl: 'https://www.ksrevenue.gov' },
  { code: 'US-KY', countryIso2: 'US', name: 'Kentucky', type: 'State', capital: 'Frankfort', url: 'https://kentucky.gov', taxUrl: 'https://revenue.ky.gov', businessUrl: 'https://onestop.ky.gov' },
  { code: 'US-LA', countryIso2: 'US', name: 'Louisiana', type: 'State', capital: 'Baton Rouge', url: 'https://www.louisiana.gov', taxUrl: 'https://latap.revenue.louisiana.gov', businessUrl: 'https://geauxbiz.sos.la.gov' },
  { code: 'US-ME', countryIso2: 'US', name: 'Maine', type: 'State', capital: 'Augusta', url: 'https://www.maine.gov', taxUrl: 'https://www.maine.gov/revenue/' },
  { code: 'US-MD', countryIso2: 'US', name: 'Maryland', type: 'State', capital: 'Annapolis', url: 'https://www.maryland.gov', openDataUrl: 'https://opendata.maryland.gov', taxUrl: 'https://www.marylandtaxes.gov', transportUrl: 'https://mva.maryland.gov' },
  { code: 'US-MA', countryIso2: 'US', name: 'Massachusetts', type: 'State', capital: 'Boston', url: 'https://www.mass.gov', openDataUrl: 'https://data.mass.gov', taxUrl: 'https://mtc.dor.state.ma.us', transportUrl: 'https://www.mass.gov/orgs/registry-of-motor-vehicles' },
  { code: 'US-MI', countryIso2: 'US', name: 'Michigan', type: 'State', capital: 'Lansing', url: 'https://www.michigan.gov', taxUrl: 'https://www.michigan.gov/taxes', businessUrl: 'https://www.michigan.gov/sos' },
  { code: 'US-MN', countryIso2: 'US', name: 'Minnesota', type: 'State', capital: 'Saint Paul', url: 'https://mn.gov', taxUrl: 'https://www.revenue.state.mn.us', transportUrl: 'https://dps.mn.gov/divisions/dvs/' },
  { code: 'US-MS', countryIso2: 'US', name: 'Mississippi', type: 'State', capital: 'Jackson', url: 'https://www.ms.gov', taxUrl: 'https://www.dor.ms.gov' },
  { code: 'US-MO', countryIso2: 'US', name: 'Missouri', type: 'State', capital: 'Jefferson City', url: 'https://www.mo.gov', openDataUrl: 'https://data.mo.gov', taxUrl: 'https://dor.mo.gov' },
  { code: 'US-MT', countryIso2: 'US', name: 'Montana', type: 'State', capital: 'Helena', url: 'https://mt.gov', taxUrl: 'https://mtrevenue.gov' },
  { code: 'US-NE', countryIso2: 'US', name: 'Nebraska', type: 'State', capital: 'Lincoln', url: 'https://www.nebraska.gov', taxUrl: 'https://revenue.nebraska.gov' },
  { code: 'US-NV', countryIso2: 'US', name: 'Nevada', type: 'State', capital: 'Carson City', url: 'https://nv.gov', taxUrl: 'https://tax.nv.gov', businessUrl: 'https://www.nvsilverflume.gov', transportUrl: 'https://dmv.nv.gov' },
  { code: 'US-NH', countryIso2: 'US', name: 'New Hampshire', type: 'State', capital: 'Concord', url: 'https://www.nh.gov', taxUrl: 'https://www.revenue.nh.gov' },
  { code: 'US-NJ', countryIso2: 'US', name: 'New Jersey', type: 'State', capital: 'Trenton', url: 'https://www.nj.gov', openDataUrl: 'https://data.nj.gov', taxUrl: 'https://www.nj.gov/treasury/taxation/', transportUrl: 'https://www.nj.gov/mvc/' },
  { code: 'US-NM', countryIso2: 'US', name: 'New Mexico', type: 'State', capital: 'Santa Fe', url: 'https://www.newmexico.gov', taxUrl: 'https://tap.state.nm.us' },
  { code: 'US-NY', countryIso2: 'US', name: 'New York', type: 'State', capital: 'Albany', url: 'https://www.ny.gov', openDataUrl: 'https://data.ny.gov', taxUrl: 'https://www.tax.ny.gov', transportUrl: 'https://dmv.ny.gov', businessUrl: 'https://businessexpress.ny.gov' },
  { code: 'US-NC', countryIso2: 'US', name: 'North Carolina', type: 'State', capital: 'Raleigh', url: 'https://www.nc.gov', taxUrl: 'https://www.ncdor.gov', transportUrl: 'https://www.ncdot.gov/dmv/' },
  { code: 'US-ND', countryIso2: 'US', name: 'North Dakota', type: 'State', capital: 'Bismarck', url: 'https://www.nd.gov', taxUrl: 'https://www.tax.nd.gov', businessUrl: 'https://firststop.sos.nd.gov' },
  { code: 'US-OH', countryIso2: 'US', name: 'Ohio', type: 'State', capital: 'Columbus', url: 'https://ohio.gov', openDataUrl: 'https://data.ohio.gov', taxUrl: 'https://tax.ohio.gov', transportUrl: 'https://www.bmv.ohio.gov' },
  { code: 'US-OK', countryIso2: 'US', name: 'Oklahoma', type: 'State', capital: 'Oklahoma City', url: 'https://oklahoma.gov', openDataUrl: 'https://data.ok.gov', taxUrl: 'https://oktap.tax.ok.gov' },
  { code: 'US-OR', countryIso2: 'US', name: 'Oregon', type: 'State', capital: 'Salem', url: 'https://www.oregon.gov', openDataUrl: 'https://data.oregon.gov', taxUrl: 'https://revenueonline.dor.oregon.gov' },
  { code: 'US-PA', countryIso2: 'US', name: 'Pennsylvania', type: 'State', capital: 'Harrisburg', url: 'https://www.pa.gov', openDataUrl: 'https://data.pa.gov', taxUrl: 'https://mypath.pa.gov', transportUrl: 'https://www.dmv.pa.gov' },
  { code: 'US-RI', countryIso2: 'US', name: 'Rhode Island', type: 'State', capital: 'Providence', url: 'https://www.ri.gov', taxUrl: 'https://tax.ri.gov' },
  { code: 'US-SC', countryIso2: 'US', name: 'South Carolina', type: 'State', capital: 'Columbia', url: 'https://sc.gov', taxUrl: 'https://mydorway.dor.sc.gov', transportUrl: 'https://www.scdmvonline.com' },
  { code: 'US-SD', countryIso2: 'US', name: 'South Dakota', type: 'State', capital: 'Pierre', url: 'https://sd.gov', taxUrl: 'https://dor.sd.gov' },
  { code: 'US-TN', countryIso2: 'US', name: 'Tennessee', type: 'State', capital: 'Nashville', url: 'https://www.tn.gov', taxUrl: 'https://tntap.tn.gov' },
  { code: 'US-TX', countryIso2: 'US', name: 'Texas', type: 'State', capital: 'Austin', url: 'https://www.texas.gov', openDataUrl: 'https://data.texas.gov', taxUrl: 'https://comptroller.texas.gov', transportUrl: 'https://www.txdmv.gov', businessUrl: 'https://www.sos.state.tx.us' },
  { code: 'US-UT', countryIso2: 'US', name: 'Utah', type: 'State', capital: 'Salt Lake City', url: 'https://www.utah.gov', openDataUrl: 'https://opendata.utah.gov', taxUrl: 'https://tap.tax.utah.gov' },
  { code: 'US-VT', countryIso2: 'US', name: 'Vermont', type: 'State', capital: 'Montpelier', url: 'https://www.vermont.gov', openDataUrl: 'https://data.vermont.gov', taxUrl: 'https://myvtax.vermont.gov' },
  { code: 'US-VA', countryIso2: 'US', name: 'Virginia', type: 'State', capital: 'Richmond', url: 'https://www.virginia.gov', openDataUrl: 'https://data.virginia.gov', taxUrl: 'https://www.tax.virginia.gov', transportUrl: 'https://www.dmv.virginia.gov' },
  { code: 'US-WA', countryIso2: 'US', name: 'Washington', type: 'State', capital: 'Olympia', url: 'https://access.wa.gov', openDataUrl: 'https://data.wa.gov', taxUrl: 'https://dor.wa.gov', transportUrl: 'https://dol.wa.gov' },
  { code: 'US-WV', countryIso2: 'US', name: 'West Virginia', type: 'State', capital: 'Charleston', url: 'https://www.wv.gov', taxUrl: 'https://mytaxes.wvtax.gov' },
  { code: 'US-WI', countryIso2: 'US', name: 'Wisconsin', type: 'State', capital: 'Madison', url: 'https://www.wisconsin.gov', taxUrl: 'https://tap.revenue.wi.gov', transportUrl: 'https://wisconsindot.gov' },
  { code: 'US-WY', countryIso2: 'US', name: 'Wyoming', type: 'State', capital: 'Cheyenne', url: 'https://www.wyo.gov', businessUrl: 'https://wyobiz.wyo.gov' },
];

const INDIA_STATES_SEED: CompactRegionSeed[] = [
  { code: 'IN-MH', countryIso2: 'IN', name: 'Maharashtra', nativeName: 'महाराष्ट्र', type: 'State', capital: 'Mumbai', url: 'https://www.maharashtra.gov.in', taxUrl: 'https://mahagst.gov.in', businessUrl: 'https://aaplesarkar.mahaonline.gov.in', transportUrl: 'https://bhulekh.mahabhumi.gov.in', judiciaryName: 'High Court of Bombay (bombayhighcourt.nic.in)', judiciaryUrl: 'https://bombayhighcourt.nic.in' },
  { code: 'IN-KA', countryIso2: 'IN', name: 'Karnataka', nativeName: 'ಕರ್ನಾಟಕ', type: 'State', capital: 'Bengaluru', url: 'https://www.karnataka.gov.in', businessUrl: 'https://sevasindhu.karnataka.gov.in', transportUrl: 'https://landrecords.karnataka.gov.in', openDataUrl: 'https://karnataka.data.gov.in', judiciaryName: 'High Court of Karnataka (karnatakajudiciary.kar.nic.in)', judiciaryUrl: 'https://karnatakajudiciary.kar.nic.in' },
  { code: 'IN-TN', countryIso2: 'IN', name: 'Tamil Nadu', nativeName: 'தமிழ்நாடு', type: 'State', capital: 'Chennai', url: 'https://www.tn.gov.in', businessUrl: 'https://www.tnesevai.tn.gov.in', transportUrl: 'https://eservices.tn.gov.in', openDataUrl: 'https://tn.data.gov.in', judiciaryName: 'High Court of Judicature at Madras — Madras High Court (hcmadras.tn.gov.in)', judiciaryUrl: 'https://hcmadras.tn.gov.in', customSummary: 'Official Tamil Nadu State Portal (tn.gov.in), High Court of Madras (hcmadras.tn.gov.in — Chennai Principal Seat & Madurai Bench cause lists, judgments, case status, e-Filing), TNeGA e-Sevai citizen services, and Patta/Chitta land records.' },
  { code: 'IN-DL', countryIso2: 'IN', name: 'Delhi (NCT)', nativeName: 'दिल्ली', type: 'Territory', capital: 'New Delhi', url: 'https://delhi.gov.in', businessUrl: 'https://edistrict.delhigovt.nic.in', taxUrl: 'https://dvat.gov.in', judiciaryName: 'High Court of Delhi (delhihighcourt.nic.in)', judiciaryUrl: 'https://delhihighcourt.nic.in' },
  { code: 'IN-UP', countryIso2: 'IN', name: 'Uttar Pradesh', nativeName: 'उत्तर प्रदेश', type: 'State', capital: 'Lucknow', url: 'https://up.gov.in', businessUrl: 'https://edistrict.up.gov.in', transportUrl: 'https://upbhulekh.gov.in', judiciaryName: 'High Court of Judicature at Allahabad (allahabadhighcourt.in)', judiciaryUrl: 'https://www.allahabadhighcourt.in' },
  { code: 'IN-GJ', countryIso2: 'IN', name: 'Gujarat', nativeName: 'ગુજરાત', type: 'State', capital: 'Gandhinagar', url: 'https://gujaratindia.gov.in', businessUrl: 'https://www.digitalgujarat.gov.in', transportUrl: 'https://anyror.gujarat.gov.in', judiciaryName: 'High Court of Gujarat (gujarathighcourt.nic.in)', judiciaryUrl: 'https://gujarathighcourt.nic.in' },
  { code: 'IN-KL', countryIso2: 'IN', name: 'Kerala', nativeName: 'കേരളം', type: 'State', capital: 'Thiruvananthapuram', url: 'https://kerala.gov.in', businessUrl: 'https://edistrict.kerala.gov.in', openDataUrl: 'https://kerala.data.gov.in', judiciaryName: 'High Court of Kerala (hckerala.gov.in)', judiciaryUrl: 'https://hckerala.gov.in' },
  { code: 'IN-WB', countryIso2: 'IN', name: 'West Bengal', nativeName: 'পশ্চিমবঙ্গ', type: 'State', capital: 'Kolkata', url: 'https://wb.gov.in', businessUrl: 'https://edistrict.wb.gov.in', transportUrl: 'https://banglarbhumi.gov.in', judiciaryName: 'High Court at Calcutta (calcuttahighcourt.gov.in)', judiciaryUrl: 'https://www.calcuttahighcourt.gov.in' },
  { code: 'IN-TG', countryIso2: 'IN', name: 'Telangana', nativeName: 'తెలంగాణ', type: 'State', capital: 'Hyderabad', url: 'https://www.telangana.gov.in', businessUrl: 'https://ts.meeseva.telangana.gov.in', openDataUrl: 'https://data.telangana.gov.in', judiciaryName: 'High Court for the State of Telangana (tshc.gov.in)', judiciaryUrl: 'https://tshc.gov.in' },
  { code: 'IN-AP', countryIso2: 'IN', name: 'Andhra Pradesh', nativeName: 'ఆంధ్ర ప్రదేశ్', type: 'State', capital: 'Amaravati', url: 'https://www.ap.gov.in', businessUrl: 'https://ap.meeseva.gov.in', transportUrl: 'https://meebhoomi.ap.gov.in', judiciaryName: 'High Court of Andhra Pradesh (aphc.gov.in)', judiciaryUrl: 'https://aphc.gov.in' },
  { code: 'IN-RJ', countryIso2: 'IN', name: 'Rajasthan', nativeName: 'राजस्थान', type: 'State', capital: 'Jaipur', url: 'https://rajasthan.gov.in', businessUrl: 'https://sso.rajasthan.gov.in', transportUrl: 'https://apnakhata.rajasthan.gov.in', judiciaryName: 'Rajasthan High Court (hcraj.nic.in)', judiciaryUrl: 'https://hcraj.nic.in' },
  { code: 'IN-MP', countryIso2: 'IN', name: 'Madhya Pradesh', nativeName: 'मध्य प्रदेश', type: 'State', capital: 'Bhopal', url: 'https://mp.gov.in', businessUrl: 'https://mpedistrict.gov.in', transportUrl: 'https://mpbhulekh.gov.in', judiciaryName: 'High Court of Madhya Pradesh (mphc.gov.in)', judiciaryUrl: 'https://mphc.gov.in' },
  { code: 'IN-BR', countryIso2: 'IN', name: 'Bihar', nativeName: 'बिहार', type: 'State', capital: 'Patna', url: 'https://state.bihar.gov.in', businessUrl: 'https://serviceonline.bihar.gov.in', transportUrl: 'https://biharbhumi.bihar.gov.in', judiciaryName: 'High Court of Judicature at Patna (patnahighcourt.gov.in)', judiciaryUrl: 'https://patnahighcourt.gov.in' },
  { code: 'IN-OR', countryIso2: 'IN', name: 'Odisha', nativeName: 'ଓଡ଼ିଶା', type: 'State', capital: 'Bhubaneswar', url: 'https://odisha.gov.in', businessUrl: 'https://edistrict.odisha.gov.in', transportUrl: 'https://bhulekh.ori.nic.in', judiciaryName: 'High Court of Orissa (orissahighcourt.nic.in)', judiciaryUrl: 'https://www.orissahighcourt.nic.in' },
  { code: 'IN-PB', countryIso2: 'IN', name: 'Punjab', nativeName: 'ਪੰਜਾਬ', type: 'State', capital: 'Chandigarh', url: 'https://punjab.gov.in', businessUrl: 'https://connect.punjab.gov.in', transportUrl: 'https://jamabandi.punjab.gov.in', judiciaryName: 'High Court of Punjab and Haryana (highcourtchd.gov.in)', judiciaryUrl: 'https://highcourtchd.gov.in' },
  { code: 'IN-HR', countryIso2: 'IN', name: 'Haryana', nativeName: 'हरियाणा', type: 'State', capital: 'Chandigarh', url: 'https://haryana.gov.in', businessUrl: 'https://saralharyana.gov.in', transportUrl: 'https://jamabandi.nic.in', judiciaryName: 'High Court of Punjab and Haryana (highcourtchd.gov.in)', judiciaryUrl: 'https://highcourtchd.gov.in' },
  { code: 'IN-AS', countryIso2: 'IN', name: 'Assam', nativeName: 'অসম', type: 'State', capital: 'Dispur', url: 'https://assam.gov.in', businessUrl: 'https://sewasetu.assam.gov.in', judiciaryName: 'Gauhati High Court (ghconline.gov.in)', judiciaryUrl: 'https://ghconline.gov.in' },
  { code: 'IN-JH', countryIso2: 'IN', name: 'Jharkhand', nativeName: 'झारखंड', type: 'State', capital: 'Ranchi', url: 'https://www.jharkhand.gov.in', businessUrl: 'https://jharsewa.jharkhand.gov.in', transportUrl: 'https://jharbhoomi.jharkhand.gov.in', judiciaryName: 'High Court of Jharkhand (jharkhandhighcourt.nic.in)', judiciaryUrl: 'https://jharkhandhighcourt.nic.in' },
  { code: 'IN-CT', countryIso2: 'IN', name: 'Chhattisgarh', nativeName: 'छत्तीसगढ़', type: 'State', capital: 'Raipur', url: 'https://cgstate.gov.in', businessUrl: 'https://edistrict.cgstate.gov.in', transportUrl: 'https://bhuiyan.cg.nic.in', judiciaryName: 'High Court of Chhattisgarh (highcourt.cg.gov.in)', judiciaryUrl: 'https://highcourt.cg.gov.in' },
  { code: 'IN-UT', countryIso2: 'IN', name: 'Uttarakhand', nativeName: 'उत्तराखंड', type: 'State', capital: 'Dehradun', url: 'https://uk.gov.in', businessUrl: 'https://eservices.uk.gov.in', transportUrl: 'https://bhulekh.uk.gov.in', judiciaryName: 'High Court of Uttarakhand (highcourtofuttarakhand.gov.in)', judiciaryUrl: 'https://highcourtofuttarakhand.gov.in' },
  { code: 'IN-HP', countryIso2: 'IN', name: 'Himachal Pradesh', nativeName: 'हिमाचल प्रदेश', type: 'State', capital: 'Shimla', url: 'https://himachal.nic.in', businessUrl: 'https://edistrict.hp.gov.in', judiciaryName: 'High Court of Himachal Pradesh (hphighcourt.nic.in)', judiciaryUrl: 'https://hphighcourt.nic.in' },
  { code: 'IN-GA', countryIso2: 'IN', name: 'Goa', nativeName: 'गोंय', type: 'State', capital: 'Panaji', url: 'https://www.goa.gov.in', businessUrl: 'https://goaonline.gov.in', judiciaryName: 'High Court of Bombay at Goa (hcbombayatgoa.nic.in)', judiciaryUrl: 'https://hcbombayatgoa.nic.in' },
  { code: 'IN-TR', countryIso2: 'IN', name: 'Tripura', type: 'State', capital: 'Agartala', url: 'https://tripura.gov.in', businessUrl: 'https://edistrict.tripura.gov.in', judiciaryName: 'High Court of Tripura (thc.nic.in)', judiciaryUrl: 'https://thc.nic.in' },
  { code: 'IN-ML', countryIso2: 'IN', name: 'Meghalaya', type: 'State', capital: 'Shillong', url: 'https://meghalaya.gov.in', businessUrl: 'https://megedistrict.gov.in', judiciaryName: 'High Court of Meghalaya (meghalayahighcourt.nic.in)', judiciaryUrl: 'https://meghalayahighcourt.nic.in' },
  { code: 'IN-MN', countryIso2: 'IN', name: 'Manipur', type: 'State', capital: 'Imphal', url: 'https://manipur.gov.in', judiciaryName: 'High Court of Manipur (hcmimphal.nic.in)', judiciaryUrl: 'https://hcmimphal.nic.in' },
  { code: 'IN-NL', countryIso2: 'IN', name: 'Nagaland', type: 'State', capital: 'Kohima', url: 'https://nagaland.gov.in', businessUrl: 'https://edistrict.nagaland.gov.in', judiciaryName: 'Gauhati High Court Kohima Bench (kohimahighcourt.gov.in)', judiciaryUrl: 'https://kohimahighcourt.gov.in' },
  { code: 'IN-AR', countryIso2: 'IN', name: 'Arunachal Pradesh', type: 'State', capital: 'Itanagar', url: 'https://arunachalpradesh.gov.in', businessUrl: 'https://eservice.arunachal.gov.in', judiciaryName: 'Gauhati High Court Itanagar Permanent Bench (ghcitanagar.gov.in)', judiciaryUrl: 'https://ghcitanagar.gov.in' },
  { code: 'IN-MZ', countryIso2: 'IN', name: 'Mizoram', type: 'State', capital: 'Aizawl', url: 'https://mizoram.nic.in', businessUrl: 'https://edistrict.mizoram.gov.in', judiciaryName: 'Gauhati High Court Aizawl Bench (ghcazlbench.nic.in)', judiciaryUrl: 'https://ghcazlbench.nic.in' },
  { code: 'IN-SK', countryIso2: 'IN', name: 'Sikkim', type: 'State', capital: 'Gangtok', url: 'https://sikkim.gov.in', openDataUrl: 'https://sikkim.data.gov.in', judiciaryName: 'High Court of Sikkim (hcs.gov.in)', judiciaryUrl: 'https://hcs.gov.in' },
  { code: 'IN-JK', countryIso2: 'IN', name: 'Jammu and Kashmir', type: 'Territory', capital: 'Srinagar / Jammu', url: 'https://jk.gov.in', businessUrl: 'https://jansugam.jk.gov.in', judiciaryName: 'High Court of Jammu & Kashmir and Ladakh (jkhighcourt.nic.in)', judiciaryUrl: 'https://jkhighcourt.nic.in' },
  { code: 'IN-CH', countryIso2: 'IN', name: 'Chandigarh', type: 'Territory', capital: 'Chandigarh', url: 'https://chandigarh.gov.in', judiciaryName: 'High Court of Punjab and Haryana (highcourtchd.gov.in)', judiciaryUrl: 'https://highcourtchd.gov.in' },
  { code: 'IN-PY', countryIso2: 'IN', name: 'Puducherry', type: 'Territory', capital: 'Puducherry', url: 'https://py.gov.in', businessUrl: 'https://edistrict.py.gov.in', judiciaryName: 'High Court of Judicature at Madras (hcmadras.tn.gov.in)', judiciaryUrl: 'https://hcmadras.tn.gov.in' },
];

const GLOBAL_REGIONS_SEED: CompactRegionSeed[] = [
  // CANADA (13 Provinces & Territories)
  { code: 'CA-ON', countryIso2: 'CA', name: 'Ontario', type: 'Province', capital: 'Toronto', url: 'https://www.ontario.ca', openDataUrl: 'https://data.ontario.ca', businessUrl: 'https://www.ontario.ca/page/serviceontario', customSummary: 'ServiceOntario digital gateway for OHIP health cards, driver & vehicle licensing, Ontario Business Registry, and provincial taxes.' },
  { code: 'CA-QC', countryIso2: 'CA', name: 'Quebec', nativeName: 'Québec', type: 'Province', capital: 'Quebec City', url: 'https://www.quebec.ca', openDataUrl: 'https://www.donneesquebec.ca', taxUrl: 'https://www.revenuquebec.ca', transportUrl: 'https://saaq.gouv.qc.ca', customSummary: 'Gouvernement du Québec portal connecting Revenu Québec, RAMQ health insurance, SAAQ driver licensing, and Registraire des entreprises.' },
  { code: 'CA-BC', countryIso2: 'CA', name: 'British Columbia', type: 'Province', capital: 'Victoria', url: 'https://www.gov.bc.ca', openDataUrl: 'https://data.gov.bc.ca', taxUrl: 'https://www2.gov.bc.ca/gov/content/taxes', customSummary: 'BC Services Card portal for Medical Services Plan (MSP), ICBC driver licensing, BC Registries and Online Services, and eTaxBC.' },
  { code: 'CA-AB', countryIso2: 'CA', name: 'Alberta', type: 'Province', capital: 'Edmonton', url: 'https://www.alberta.ca', openDataUrl: 'https://open.alberta.ca', customSummary: 'Alberta.ca Account portal for registry services, health care insurance plan, corporate registry, and TRA tax administration.' },
  { code: 'CA-MB', countryIso2: 'CA', name: 'Manitoba', type: 'Province', capital: 'Winnipeg', url: 'https://www.gov.mb.ca', taxUrl: 'https://taxcess.gov.mb.ca' },
  { code: 'CA-SK', countryIso2: 'CA', name: 'Saskatchewan', type: 'Province', capital: 'Regina', url: 'https://www.saskatchewan.ca', transportUrl: 'https://sgi.sk.ca' },
  { code: 'CA-NS', countryIso2: 'CA', name: 'Nova Scotia', type: 'Province', capital: 'Halifax', url: 'https://novascotia.ca', openDataUrl: 'https://data.novascotia.ca' },
  { code: 'CA-NB', countryIso2: 'CA', name: 'New Brunswick', nativeName: 'Nouveau-Brunswick', type: 'Province', capital: 'Fredericton', url: 'https://www2.gnb.ca', businessUrl: 'https://www.snb.ca' },
  { code: 'CA-NL', countryIso2: 'CA', name: 'Newfoundland and Labrador', type: 'Province', capital: "St. John's", url: 'https://www.gov.nl.ca', openDataUrl: 'https://opendata.gov.nl.ca' },
  { code: 'CA-PE', countryIso2: 'CA', name: 'Prince Edward Island', type: 'Province', capital: 'Charlottetown', url: 'https://www.princeedwardisland.ca' },
  { code: 'CA-NT', countryIso2: 'CA', name: 'Northwest Territories', type: 'Territory', capital: 'Yellowknife', url: 'https://www.gov.nt.ca' },
  { code: 'CA-YT', countryIso2: 'CA', name: 'Yukon', type: 'Territory', capital: 'Whitehorse', url: 'https://yukon.ca' },
  { code: 'CA-NU', countryIso2: 'CA', name: 'Nunavut', type: 'Territory', capital: 'Iqaluit', url: 'https://www.gov.nu.ca' },

  // GERMANY (16 Bundesländer)
  { code: 'DE-BY', countryIso2: 'DE', name: 'Bavaria', nativeName: 'Freistaat Bayern', type: 'Bundesland', capital: 'Munich', url: 'https://www.bayern.de', businessUrl: 'https://www.freistaat.bayern', openDataUrl: 'https://open.bydata.de', customSummary: 'BayernPortal (freistaat.bayern) linking over 2,000 Bavarian municipal and state administrative procedures with BayernID.' },
  { code: 'DE-NW', countryIso2: 'DE', name: 'North Rhine-Westphalia', nativeName: 'Nordrhein-Westfalen', type: 'Bundesland', capital: 'Düsseldorf', url: 'https://www.land.nrw', businessUrl: 'https://service.wirtschaft.nrw', openDataUrl: 'https://open.nrw' },
  { code: 'DE-BW', countryIso2: 'DE', name: 'Baden-Württemberg', type: 'Bundesland', capital: 'Stuttgart', url: 'https://www.baden-wuerttemberg.de', businessUrl: 'https://www.service-bw.de' },
  { code: 'DE-BE', countryIso2: 'DE', name: 'Berlin', type: 'Bundesland', capital: 'Berlin', url: 'https://www.berlin.de', businessUrl: 'https://service.berlin.de', openDataUrl: 'https://daten.berlin.de', customSummary: 'Service-Portal Berlin for Bürgeramt appointments (Anmeldung), residency, business registration, and state administration.' },
  { code: 'DE-HH', countryIso2: 'DE', name: 'Hamburg', type: 'Bundesland', capital: 'Hamburg', url: 'https://www.hamburg.de', openDataUrl: 'https://transparenz.hamburg.de' },
  { code: 'DE-HE', countryIso2: 'DE', name: 'Hesse', nativeName: 'Hessen', type: 'Bundesland', capital: 'Wiesbaden', url: 'https://hessen.de', businessUrl: 'https://verwaltungsportal.hessen.de' },
  { code: 'DE-NI', countryIso2: 'DE', name: 'Lower Saxony', nativeName: 'Niedersachsen', type: 'Bundesland', capital: 'Hanover', url: 'https://www.niedersachsen.de', businessUrl: 'https://service.niedersachsen.de' },
  { code: 'DE-SN', countryIso2: 'DE', name: 'Saxony', nativeName: 'Freistaat Sachsen', type: 'Bundesland', capital: 'Dresden', url: 'https://www.sachsen.de', businessUrl: 'https://www.amt24.sachsen.de' },
  { code: 'DE-RP', countryIso2: 'DE', name: 'Rhineland-Palatinate', nativeName: 'Rheinland-Pfalz', type: 'Bundesland', capital: 'Mainz', url: 'https://www.rlp.de', openDataUrl: 'https://daten.rlp.de' },
  { code: 'DE-SH', countryIso2: 'DE', name: 'Schleswig-Holstein', type: 'Bundesland', capital: 'Kiel', url: 'https://www.schleswig-holstein.de', openDataUrl: 'https://opendata.schleswig-holstein.de' },
  { code: 'DE-BB', countryIso2: 'DE', name: 'Brandenburg', type: 'Bundesland', capital: 'Potsdam', url: 'https://www.brandenburg.de', businessUrl: 'https://service.brandenburg.de' },
  { code: 'DE-TH', countryIso2: 'DE', name: 'Thuringia', nativeName: 'Freistaat Thüringen', type: 'Bundesland', capital: 'Erfurt', url: 'https://thueringen.de' },
  { code: 'DE-ST', countryIso2: 'DE', name: 'Saxony-Anhalt', nativeName: 'Sachsen-Anhalt', type: 'Bundesland', capital: 'Magdeburg', url: 'https://www.sachsen-anhalt.de' },
  { code: 'DE-MV', countryIso2: 'DE', name: 'Mecklenburg-Vorpommern', type: 'Bundesland', capital: 'Schwerin', url: 'https://www.regierung-mv.de', businessUrl: 'https://www.mv-serviceportal.de' },
  { code: 'DE-SL', countryIso2: 'DE', name: 'Saarland', type: 'Bundesland', capital: 'Saarbrücken', url: 'https://www.saarland.de' },
  { code: 'DE-HB', countryIso2: 'DE', name: 'Bremen', type: 'Bundesland', capital: 'Bremen', url: 'https://www.service.bremen.de' },

  // AUSTRALIA (8 States & Territories)
  { code: 'AU-NSW', countryIso2: 'AU', name: 'New South Wales', type: 'State', capital: 'Sydney', url: 'https://www.nsw.gov.au', businessUrl: 'https://www.service.nsw.gov.au', openDataUrl: 'https://data.nsw.gov.au', customSummary: 'Service NSW digital wallet & portal for driver licenses, Opal transport, birth/marriage certificates, Revenue NSW, and Fair Trading.' },
  { code: 'AU-VIC', countryIso2: 'AU', name: 'Victoria', type: 'State', capital: 'Melbourne', url: 'https://www.vic.gov.au', businessUrl: 'https://service.vic.gov.au', openDataUrl: 'https://www.data.vic.gov.au', taxUrl: 'https://www.sro.vic.gov.au' },
  { code: 'AU-QLD', countryIso2: 'AU', name: 'Queensland', type: 'State', capital: 'Brisbane', url: 'https://www.qld.gov.au', openDataUrl: 'https://www.data.qld.gov.au', taxUrl: 'https://qro.qld.gov.au' },
  { code: 'AU-WA', countryIso2: 'AU', name: 'Western Australia', type: 'State', capital: 'Perth', url: 'https://www.wa.gov.au', openDataUrl: 'https://data.wa.gov.au' },
  { code: 'AU-SA', countryIso2: 'AU', name: 'South Australia', type: 'State', capital: 'Adelaide', url: 'https://www.sa.gov.au', openDataUrl: 'https://data.sa.gov.au' },
  { code: 'AU-TAS', countryIso2: 'AU', name: 'Tasmania', type: 'State', capital: 'Hobart', url: 'https://www.service.tas.gov.au' },
  { code: 'AU-ACT', countryIso2: 'AU', name: 'Australian Capital Territory', type: 'Territory', capital: 'Canberra', url: 'https://www.act.gov.au', businessUrl: 'https://www.accesscanberra.act.gov.au', openDataUrl: 'https://www.data.act.gov.au' },
  { code: 'AU-NT', countryIso2: 'AU', name: 'Northern Territory', type: 'Territory', capital: 'Darwin', url: 'https://nt.gov.au', openDataUrl: 'https://data.nt.gov.au' },

  // UNITED KINGDOM (Devolved Nations & Major Authorities)
  { code: 'GB-SCT', countryIso2: 'GB', name: 'Scotland', nativeName: 'Alba', type: 'Devolved Nation', capital: 'Edinburgh', url: 'https://www.gov.scot', businessUrl: 'https://www.mygov.scot', taxUrl: 'https://www.revenue.scot', openDataUrl: 'https://statistics.gov.scot', customSummary: 'Scottish Government & mygov.scot portal for Social Security Scotland, Revenue Scotland (LBTT/Scottish Income Tax), NHS Scotland, and Registers of Scotland.' },
  { code: 'GB-WLS', countryIso2: 'GB', name: 'Wales', nativeName: 'Cymru', type: 'Devolved Nation', capital: 'Cardiff', url: 'https://www.gov.wales', taxUrl: 'https://www.gov.wales/welsh-revenue-authority', openDataUrl: 'https://statswales.gov.wales', customSummary: 'Bilingual Welsh Government (Llywodraeth Cymru) portal covering Welsh Revenue Authority, Business Wales, NHS Wales, and local council services.' },
  { code: 'GB-NIR', countryIso2: 'GB', name: 'Northern Ireland', type: 'Devolved Nation', capital: 'Belfast', url: 'https://www.nidirect.gov.uk', openDataUrl: 'https://www.opendatani.gov.uk', customSummary: 'nidirect official portal for Northern Ireland driver & vehicle licensing (DVA), Land & Property Services (rates), AccessNI, and health services.' },
  { code: 'GB-LDN', countryIso2: 'GB', name: 'Greater London Authority', type: 'Municipality', capital: 'London', url: 'https://www.london.gov.uk', transportUrl: 'https://tfl.gov.uk', openDataUrl: 'https://data.london.gov.uk', customSummary: 'Mayor of London, London Assembly, Transport for London (TfL Oyster/ULEZ), Metropolitan Police, and London Datastore.' },

  // BRAZIL (Major States)
  { code: 'BR-SP', countryIso2: 'BR', name: 'São Paulo', type: 'State', capital: 'São Paulo', url: 'https://www.sp.gov.br', businessUrl: 'https://www.poupatempo.sp.gov.br', taxUrl: 'https://portal.fazenda.sp.gov.br', transportUrl: 'https://www.detran.sp.gov.br', customSummary: 'Poupatempo SP.GOV.BR digital gateway for RG civil ID, Detran.SP vehicle licensing, SEFAZ-SP IPVA/ICMS taxes, and JUCESP business registry.' },
  { code: 'BR-RJ', countryIso2: 'BR', name: 'Rio de Janeiro', type: 'State', capital: 'Rio de Janeiro', url: 'https://www.rj.gov.br', taxUrl: 'https://portal.fazenda.rj.gov.br', transportUrl: 'https://www.detran.rj.gov.br' },
  { code: 'BR-MG', countryIso2: 'BR', name: 'Minas Gerais', type: 'State', capital: 'Belo Horizonte', url: 'https://www.mg.gov.br', taxUrl: 'https://www.fazenda.mg.gov.br', openDataUrl: 'https://dados.mg.gov.br' },
  { code: 'BR-RS', countryIso2: 'BR', name: 'Rio Grande do Sul', type: 'State', capital: 'Porto Alegre', url: 'https://www.rs.gov.br', openDataUrl: 'https://dados.rs.gov.br' },
  { code: 'BR-PR', countryIso2: 'BR', name: 'Paraná', type: 'State', capital: 'Curitiba', url: 'https://www.pr.gov.br', taxUrl: 'https://www.fazenda.pr.gov.br' },
  { code: 'BR-BA', countryIso2: 'BR', name: 'Bahia', type: 'State', capital: 'Salvador', url: 'https://www.ba.gov.br' },
  { code: 'BR-DF', countryIso2: 'BR', name: 'Distrito Federal', type: 'Territory', capital: 'Brasília', url: 'https://www.df.gov.br', taxUrl: 'https://www.receita.fazenda.df.gov.br' },

  // JAPAN (Major Prefectures)
  { code: 'JP-13', countryIso2: 'JP', name: 'Tokyo Metropolis', nativeName: '東京都', type: 'Prefecture', capital: 'Shinjuku, Tokyo', url: 'https://www.metro.tokyo.lg.jp', taxUrl: 'https://www.tax.metro.tokyo.lg.jp', openDataUrl: 'https://portal.data.metro.tokyo.lg.jp', customSummary: 'Tokyo Metropolitan Government portal for metropolitan taxation, disaster prevention, urban planning, and Tokyo Open Data catalog.' },
  { code: 'JP-27', countryIso2: 'JP', name: 'Osaka Prefecture', nativeName: '大阪府', type: 'Prefecture', capital: 'Osaka', url: 'https://www.pref.osaka.lg.jp' },
  { code: 'JP-14', countryIso2: 'JP', name: 'Kanagawa Prefecture', nativeName: '神奈川県', type: 'Prefecture', capital: 'Yokohama', url: 'https://www.pref.kanagawa.jp' },
  { code: 'JP-23', countryIso2: 'JP', name: 'Aichi Prefecture', nativeName: '愛知県', type: 'Prefecture', capital: 'Nagoya', url: 'https://www.pref.aichi.jp' },
  { code: 'JP-26', countryIso2: 'JP', name: 'Kyoto Prefecture', nativeName: '京都府', type: 'Prefecture', capital: 'Kyoto', url: 'https://www.pref.kyoto.jp' },
  { code: 'JP-01', countryIso2: 'JP', name: 'Hokkaido', nativeName: '北海道', type: 'Prefecture', capital: 'Sapporo', url: 'https://www.pref.hokkaido.lg.jp' },
  { code: 'JP-40', countryIso2: 'JP', name: 'Fukuoka Prefecture', nativeName: '福岡県', type: 'Prefecture', capital: 'Fukuoka', url: 'https://www.pref.fukuoka.lg.jp', openDataUrl: 'https://ckan.open-governmentdata.org' },

  // MEXICO (Major States)
  { code: 'MX-CMX', countryIso2: 'MX', name: 'Mexico City (CDMX)', nativeName: 'Ciudad de México', type: 'State', capital: 'Mexico City', url: 'https://www.cdmx.gob.mx', businessUrl: 'https://llave.cdmx.gob.mx', taxUrl: 'https://www.finanzas.cdmx.gob.mx', openDataUrl: 'https://datos.cdmx.gob.mx', customSummary: 'Llave CDMX single sign-on portal for digital driver licenses, property tax (Predial), water bills, civil registry, and business permits.' },
  { code: 'MX-JAL', countryIso2: 'MX', name: 'Jalisco', type: 'State', capital: 'Guadalajara', url: 'https://www.jalisco.gob.mx', openDataUrl: 'https://datos.jalisco.gob.mx' },
  { code: 'MX-NLE', countryIso2: 'MX', name: 'Nuevo León', type: 'State', capital: 'Monterrey', url: 'https://www.nl.gob.mx' },
  { code: 'MX-MEX', countryIso2: 'MX', name: 'Estado de México', type: 'State', capital: 'Toluca', url: 'https://edomex.gob.mx' },

  // SPAIN (Autonomous Communities)
  { code: 'ES-MD', countryIso2: 'ES', name: 'Community of Madrid', nativeName: 'Comunidad de Madrid', type: 'Autonomous Community', capital: 'Madrid', url: 'https://www.comunidad.madrid', openDataUrl: 'https://datos.comunidad.madrid' },
  { code: 'ES-CT', countryIso2: 'ES', name: 'Catalonia', nativeName: 'Catalunya', type: 'Autonomous Community', capital: 'Barcelona', url: 'https://web.gencat.cat', taxUrl: 'https://atc.gencat.cat', openDataUrl: 'https://analisi.transparenciacatalunya.cat' },
  { code: 'ES-AN', countryIso2: 'ES', name: 'Andalusia', nativeName: 'Andalucía', type: 'Autonomous Community', capital: 'Seville', url: 'https://www.juntadeandalucia.es' },
  { code: 'ES-PV', countryIso2: 'ES', name: 'Basque Country', nativeName: 'Euskadi / País Vasco', type: 'Autonomous Community', capital: 'Vitoria-Gasteiz', url: 'https://www.euskadi.eus', openDataUrl: 'https://opendata.euskadi.eus' },

  // SWITZERLAND (Cantons)
  { code: 'CH-ZH', countryIso2: 'CH', name: 'Canton of Zurich', nativeName: 'Kanton Zürich', type: 'Canton', capital: 'Zurich', url: 'https://www.zh.ch', openDataUrl: 'https://www.zh.ch/de/politik-staat/opendata.html' },
  { code: 'CH-GE', countryIso2: 'CH', name: 'Republic and Canton of Geneva', nativeName: 'République et Canton de Genève', type: 'Canton', capital: 'Geneva', url: 'https://www.ge.ch' },
  { code: 'CH-BE', countryIso2: 'CH', name: 'Canton of Bern', nativeName: 'Kanton Bern / Canton de Berne', type: 'Canton', capital: 'Bern', url: 'https://www.be.ch' },
  { code: 'CH-VD', countryIso2: 'CH', name: 'Canton of Vaud', nativeName: 'Canton de Vaud', type: 'Canton', capital: 'Lausanne', url: 'https://www.vd.ch' },

  // UAE (Emirates)
  { code: 'AE-AZ', countryIso2: 'AE', name: 'Abu Dhabi', nativeName: 'أبوظبي', type: 'Emirate', capital: 'Abu Dhabi', url: 'https://www.tamm.abudhabi', openDataUrl: 'https://data.abudhabi', customSummary: 'TAMM Abu Dhabi unified government ecosystem providing 700+ services across housing, health (DOH), transport (Darb), business licensing (ADDED), and judicial services.' },
  { code: 'AE-DU', countryIso2: 'AE', name: 'Dubai', nativeName: 'دبي', type: 'Emirate', capital: 'Dubai', url: 'https://www.dubai.ae', transportUrl: 'https://www.rta.ae', businessUrl: 'https://www.investindubai.gov.ae', openDataUrl: 'https://www.dubaipulse.gov.ae', customSummary: 'Digital Dubai & DubaiNow platform connecting RTA transport, DEWA utilities, Dubai Land Department (Ejari), GDRFA residency visas, and Dubai Economy.' },
  { code: 'AE-SH', countryIso2: 'AE', name: 'Sharjah', nativeName: 'الشارقة', type: 'Emirate', capital: 'Sharjah', url: 'https://www.sharjah.ae' },

  // NIGERIA (Major States)
  { code: 'NG-LA', countryIso2: 'NG', name: 'Lagos State', type: 'State', capital: 'Ikeja', url: 'https://lagosstate.gov.ng', taxUrl: 'https://etax.lirs.net', businessUrl: 'https://lagsra.lagosstate.gov.ng', customSummary: 'Lagos State Government portal for LIRS e-Tax, LASRRA residents registration, e-GIS land administration, and LASG citizen gate.' },
  { code: 'NG-FC', countryIso2: 'NG', name: 'Federal Capital Territory (Abuja)', type: 'Territory', capital: 'Abuja', url: 'https://fcta.gov.ng', taxUrl: 'https://fctirs.gov.ng', transportUrl: 'https://agis.fcta.gov.ng' },
  { code: 'NG-RI', countryIso2: 'NG', name: 'Rivers State', type: 'State', capital: 'Port Harcourt', url: 'https://riversstate.gov.ng', taxUrl: 'https://rivtamis.riversbirs.gov.ng' },
  { code: 'NG-KD', countryIso2: 'NG', name: 'Kaduna State', type: 'State', capital: 'Kaduna', url: 'https://kdsg.gov.ng', taxUrl: 'https://kadirs.kdsg.gov.ng' },

  // SOUTH AFRICA (Provinces)
  { code: 'ZA-WC', countryIso2: 'ZA', name: 'Western Cape', type: 'Province', capital: 'Cape Town', url: 'https://www.westerncape.gov.za', transportUrl: 'https://www.capetown.gov.za' },
  { code: 'ZA-GP', countryIso2: 'ZA', name: 'Gauteng', type: 'Province', capital: 'Johannesburg', url: 'https://www.gauteng.gov.za' },
  { code: 'ZA-KZN', countryIso2: 'ZA', name: 'KwaZulu-Natal', type: 'Province', capital: 'Pietermaritzburg', url: 'https://www.kznonline.gov.za' },

  // CHINA (Municipalities & Provinces)
  { code: 'CN-BJ', countryIso2: 'CN', name: 'Beijing Municipality', nativeName: '北京市', type: 'Municipality', capital: 'Beijing', url: 'https://www.beijing.gov.cn', openDataUrl: 'https://data.beijing.gov.cn', customSummary: 'Beijing Municipal Government portal (Jingtong / 北京市政务服务网) for household registration, municipal taxation, corporate licensing, and open data.' },
  { code: 'CN-SH', countryIso2: 'CN', name: 'Shanghai Municipality', nativeName: '上海市', type: 'Municipality', capital: 'Shanghai', url: 'https://www.shanghai.gov.cn', openDataUrl: 'https://data.sh.gov.cn', customSummary: 'Suishenban (一网通办) Shanghai One-Network Unified Portal for citizen, foreign resident, and enterprise services.' },
  { code: 'CN-GD', countryIso2: 'CN', name: 'Guangdong Province', nativeName: '广东省', type: 'Province', capital: 'Guangzhou', url: 'https://www.gd.gov.cn', businessUrl: 'https://www.gdzwfw.gov.cn', openDataUrl: 'https://gddata.gd.gov.cn' },
  { code: 'CN-HK', countryIso2: 'CN', name: 'Hong Kong SAR', nativeName: '香港特別行政區', type: 'Territory', capital: 'Hong Kong', url: 'https://www.gov.hk', taxUrl: 'https://www.ird.gov.hk', openDataUrl: 'https://data.gov.hk', customSummary: 'GovHK & iAM Smart digital portal for Inland Revenue (eTAX), Immigration Department, Companies Registry, and CSDI spatial/open data.' },
];

function hydrateRegion(seed: CompactRegionSeed): SubNationalRegion {
  const services: SubNationalRegion['localServices'] = [
    {
      name: `${seed.name} Central E-Government & Citizen Services Portal`,
      category: 'local_municipal',
      url: seed.businessUrl || seed.url,
      whatYouCanDo: `Access official ${seed.name} (${seed.type}) resident services, vital records (birth/marriage certificates), local permits, public school enrollment, and municipal utility directories.`,
    },
    {
      name: `${seed.name} Revenue, Property & State Taxation Portal`,
      category: 'tax_finance',
      url: seed.taxUrl || seed.url,
      whatYouCanDo: `File and pay ${seed.name} state/provincial income tax, sales/VAT/GST returns, property tax assessments, and view fiscal transparency ledgers.`,
    },
    {
      name: `${seed.name} Business Registration, Licensing & Land Cadastre`,
      category: 'business_trade',
      url: seed.transportUrl || seed.businessUrl || seed.url,
      whatYouCanDo: `Register corporations/LLCs, verify trade licenses, inspect land/property titles (cadastre), and manage driver/vehicle registration in ${seed.name}.`,
    },
  ];

  if (seed.judiciaryUrl) {
    services.push({
      name: seed.judiciaryName || `${seed.name} High Court & Judicial e-Services Portal`,
      category: 'justice_law',
      url: seed.judiciaryUrl,
      whatYouCanDo: `Access official ${
        seed.judiciaryName || `${seed.name} High Court`
      } daily & weekly cause lists, case status lookup, certified judgment/order downloads, e-Filing, court fee payment, and judicial rosters.`,
    });
  }

  if (seed.openDataUrl) {
    services.push({
      name: `${seed.name} Open Data & Geospatial API Catalog`,
      category: 'open_data_api',
      url: seed.openDataUrl,
      whatYouCanDo: `Query machine-readable datasets, municipal budgets, transit feeds, and REST APIs published by ${seed.name} authorities.`,
    });
  }

  return {
    id: seed.code,
    countryIso2: seed.countryIso2,
    name: seed.name,
    nativeName: seed.nativeName,
    type: seed.type,
    capitalOrSeat: seed.capital,
    officialUrl: seed.url,
    summary:
      seed.customSummary ||
      `Official ${seed.type.toLowerCase()} government portal of ${seed.name} (Capital: ${seed.capital}), providing regional taxation, civil certificates, business licensing, transport/land records, and municipal services.`,
    localServices: services,
    openDataUrl: seed.openDataUrl,
  };
}

export const SUB_NATIONAL_REGISTRY: SubNationalRegion[] = [
  ...US_STATES_SEED.map(hydrateRegion),
  ...INDIA_STATES_SEED.map(hydrateRegion),
  ...GLOBAL_REGIONS_SEED.map(hydrateRegion),
];
