-- Realistic non-production records. Auth users are created separately through Supabase Auth.
insert into public.businesses (id, name, code, base_url, support_phone, default_locality, settings)
values ('10000000-0000-4000-8000-000000000001', 'Pilot Realty', 'WH', 'http://localhost:3000', '+919876500000', 'Whitefield', '{"business_hours":{"start":"09:30","end":"18:30"}}');

insert into public.contacts (id, business_id, kind, full_name, phone_e164, email) values
('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'OWNER', 'Ananya Rao', '+919876500101', 'ananya@example.test'),
('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'TENANT', 'Vikram Mehta', '+919876500102', 'vikram@example.test'),
('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'BUYER', 'Neha Iyer', '+919876500103', 'neha@example.test');

insert into public.properties (id, business_id, owner_contact_id, transaction_type, locality, society, property_type, bhk, area_sqft, price_amount, available_from, furnishing, parking, amenities, consent_confirmed_at, internal_notes) values
('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'RENT', 'Whitefield', 'Cedar Heights', 'Apartment', 2, 1180, 42000, current_date + 14, 'SEMI_FURNISHED', true, array['power backup','gym','security'], now(), 'Seed record for intake and verification testing'),
('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'RESALE', 'Brookefield', 'Lakeview Residency', 'Apartment', 3, 1650, 14500000, current_date, 'UNFURNISHED', true, array['clubhouse','pool','security'], now(), 'Seed resale inventory');

insert into public.requirements (id, business_id, contact_id, transaction_type, preferred_localities, radius_km, property_types, bhk_min, bhk_max, budget_min, budget_max, timeline, furnishing, parking_required, pets, brokerage_accepted, consent_confirmed_at, lead_source) values
('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'RENT', array['Whitefield','Brookefield'], 5, array['Apartment'], 2, 2, 35000, 48000, current_date + 30, array['SEMI_FURNISHED','FULLY_FURNISHED'], true, true, true, now(), 'Referral'),
('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', 'RESALE', array['Whitefield'], 8, array['Apartment','Villa'], 3, 4, 12000000, 18000000, current_date + 90, array['UNFURNISHED','SEMI_FURNISHED'], true, false, true, now(), 'Website');

insert into public.consents (business_id, contact_id, purpose, granted, source)
select '10000000-0000-4000-8000-000000000001', id, 'WHATSAPP_OPERATIONAL', true, 'SEED' from public.contacts;

