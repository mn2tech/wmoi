-- Seed script: 19 churches from Word Ministries of India
-- Churches having fellowship with Word Ministries of India

-- Insert all 19 churches from the spreadsheet
-- Note: Church names include village to ensure uniqueness
INSERT INTO churches (name, location, pastor_name) VALUES
-- Churches 1-14
('Evengelical Baptist Church - Maripadiga', 'Maripadiga', 'Rev.P.Sudhakar'),
('Catherine Memorial Baptist Church - Nirumala', 'Nirumala', 'Rev.P.Yesuratnam'),
('Victor Memorial Baptist Church - Gummedavelly', 'Gummedavelly', 'Rev.N.David'),
('Suvartha Baptist Church - Linghalganpur', 'Linghalganpur', 'Rev.N.Sathya Paul'),
('Jerome Memorial Baptist Church - Nellutla', 'Nellutla', 'Rev.Dr.G.Emmaniel'),
('Suvartha Baptist Church - Kothapelly', 'Kothapelly', 'Rev.N.Abraham'),
('Suvartha Baptist Church - Nelapogula', 'Nelapogula', 'Rev.P.Prabhakar'),
('Suvartha Baptist Church - Gangapuram', 'Gangapuram', 'Pastor.P.Salomon'),
('Suvartha Baptist Church - Gollapelly', 'Gollapelly', 'Pastor.P.Devadanam'),
('Suvartha Baptist Church - Ibrahimpuram', 'Ibrahimpuram', 'Rev.N.Sukumar'),
('Suvartha Baptist Church - Raghavapur', 'Raghavapur', 'Rev.B.Sahodhar'),
('Pandu Simhadri Memorial Baptist Church - Indra Nagar', 'Indra Nagar', 'Rev.Dr.Cortnel'),
('Suvartha Baptist Church - StationGhanpur', 'StationGhanpur', 'Rev.Ch.Thimothy'),
('Suvartha Baptist Church - Samudrala', 'Samudrala', 'Rev.Ch.Ashirvadam'),

-- Churches 15-19 (Having Fellowship with Word Ministries of India)
('Rakashana Suvartha Baptist Church - Banjar', 'Banjar', 'Sister.G.Sumalatha'),
('Suvartha Baptist Church - Rajavaram', 'Rajavaram', 'Pastor.P.Prashanth'),
('Suvartha Baptist Church - Meedikonda', 'Meedikonda', 'Rev.V.Anandam'),
('Suvartha Baptist Church - Thimmampet', 'Thimmampet', 'Rev.T.Praveen'),
('Christ Faith Temple - Palakurthy', 'Palakurthy', 'Sister.A.Rajitha')
ON CONFLICT (name) DO NOTHING;
