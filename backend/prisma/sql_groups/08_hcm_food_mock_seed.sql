-- HCM food mock seed for mobile map testing
-- Run AFTER:
--   1) canonical Prisma migrations
--   2) 07_search_map_mobile_supabase.sql

create or replace function public.make_mock_food_review(
  p_place text,
  p_signature text,
  p_texture text,
  p_service text,
  p_crowd_tip text,
  p_best_time text,
  p_value_note text
)
returns text
language plpgsql
immutable
as $$
begin
  return concat_ws(
    E'\n\n',
    'Lan ghe gan day cua toi o ' || p_place || ' xay ra vao mot ngay trong tuan nhung quan van dong deu. Dieu de lai an tuong dau tien la cach van hanh kha chac tay: khach den lien tuc, mon ra deu, ban ghe duoc don nhanh va nhin chung khong co cam giac vo tran. Neu xem day la mot diem den dai dien cho am thuc TP.HCM thi noi nay co du chat pho thong nhung van giu duoc net rieng de nguoi moi den cung co the nho ten sau mot lan thu.',
    'Mon de nho nhat trong bua cua toi la ' || p_signature || '. Cam nhan tong the la ' || p_texture || '. Diem hay cua mon nay nam o viec mui vi khong bi mot chieu: luc moi an thay ro net chinh, nhung cang an lai cang thay co lop huong va hau vi giu duoc tren luoi. Day la kieu mon an hop de review vi nguoi an de nho, de so sanh giua cac lan ghe va cung de tranh cai mot cach co co so.',
    'Ve trai nghiem tai ban, danh gia cong bang thi ' || p_service || '. Toi khong xem day la mot noi phuc vu theo kieu nha hang fine dining; gia tri cua no la su thang, ro va on dinh. Neu di nhom 2-4 nguoi thi nhin chung de goi mon va de chia se cam nhan hon. Voi du khach hoac nguoi moi den TP.HCM, quan nay de hieu, de tiep can va khong bat phai co qua nhieu kinh nghiem am thuc truoc do.',
    'Mot ghi chu rat thuc te la ' || p_crowd_tip || '. Theo toi, khung gio hop ly nhat la ' || p_best_time || '. Di dung khung nay se de nhan ra chat luong that cua mon an hon, vi khong bi tam ly cho doi qua lau hoac ban ngoi qua chat lam anh huong cam nhan. Neu ban review tren mobile, day cung la boi canh tot de ghi nhan thoi gian phuc vu, mat do khach va do on dinh giua cac khung gio.',
    'Ve gia tri su dung, ' || p_value_note || '. Toi danh gia cao nhung dia diem co kha nang lap lai trai nghiem tot qua nhieu lan ghe, khong chi ngon trong mot lan may man. Chinh vi vay, review cho nhung quan nhu the nay nen co du mo ta ve mon, khong gian, nhiet do phuc vu, su on dinh va doi tuong khach phu hop. Nhung diem nay moi giup search va ranking phan biet duoc review co ich voi review qua ngan hoac qua cam tinh.',
    'Tong ket lai, toi xem ' || p_place || ' la mot dia chi nen co mat trong bo du lieu mau cho TP.HCM. No du noi tieng de nguoi dung thu search, du de tranh luan de sinh review chat luong, va du on dinh de lam moc so sanh cho nhung quan khac. Neu can de xuat nhanh, toi van san sang gioi thieu noi nay cho ban be muon bat dau kham pha am thuc Sai Gon bang mot diem den de nho va de review lai sau do.'
  );
end;
$$;

insert into public.users (
  email,
  account_status,
  is_email_verified,
  role,
  ks_score,
  trust_level,
  reputation_score,
  know_u_balance,
  created_at,
  updated_at
)
values
  ('an.nguyen.seed@mock.local', 'active', true, 'user', 320, 2, 120, 80, now() - interval '120 days', now()),
  ('minh.tran.seed@mock.local', 'active', true, 'user', 460, 3, 180, 95, now() - interval '110 days', now()),
  ('ha.le.seed@mock.local', 'active', true, 'user', 280, 2, 90, 60, now() - interval '100 days', now()),
  ('quang.pham.seed@mock.local', 'active', true, 'user', 510, 3, 210, 110, now() - interval '90 days', now()),
  ('thao.vo.seed@mock.local', 'active', true, 'user', 390, 2, 150, 75, now() - interval '80 days', now()),
  ('linh.dang.seed@mock.local', 'active', true, 'user', 610, 4, 260, 130, now() - interval '70 days', now()),
  ('khanh.bui.seed@mock.local', 'active', true, 'user', 340, 2, 140, 65, now() - interval '60 days', now()),
  ('yen.ho.seed@mock.local', 'active', true, 'user', 430, 3, 175, 90, now() - interval '50 days', now())
on conflict (email) do update
set updated_at = excluded.updated_at;

insert into public.user_profiles (
  user_id,
  display_name,
  bio,
  city,
  country,
  created_at,
  updated_at
)
select
  u.id,
  v.display_name,
  v.bio,
  'Ho Chi Minh City',
  'Vietnam',
  now() - interval '30 days',
  now()
from public.users u
join (
  values
    ('an.nguyen.seed@mock.local', 'An Nguyen', 'Reviewer tap trung vao mon Viet truyen thong va thoi quen an trua tai trung tam thanh pho.'),
    ('minh.tran.seed@mock.local', 'Minh Tran', 'Thu mon theo goc do do on dinh, toc do phuc vu va gia tri quay lai nhieu lan.'),
    ('ha.le.seed@mock.local', 'Ha Le', 'Hay review quan an duong pho, uu tien noi co ban sac ro va de gioi thieu cho nguoi moi.'),
    ('quang.pham.seed@mock.local', 'Quang Pham', 'Quan tam nhieu den mon nuoc, chat luong nuoc dung va do can bang trong tong the bua an.'),
    ('thao.vo.seed@mock.local', 'Thao Vo', 'Thu mon theo nhom nho, de y den khong gian, muc do thoai mai va khau phan.'),
    ('linh.dang.seed@mock.local', 'Linh Dang', 'Thich cac dia chi co kha nang giu chat luong on dinh trong gio dong khach.'),
    ('khanh.bui.seed@mock.local', 'Khanh Bui', 'Tap trung vao cam nhan that de sau nay lam du lieu cho search va recommendation.'),
    ('yen.ho.seed@mock.local', 'Yen Ho', 'Thich nhung dia chi noi tieng nhung van con giu duoc ban sac va nhip van hanh ro rang.')
) as v(email, display_name, bio)
  on v.email = u.email
on conflict (user_id) do update
set display_name = excluded.display_name,
    bio = excluded.bio,
    city = excluded.city,
    country = excluded.country,
    updated_at = excluded.updated_at;

insert into public.contexts (
  type,
  name,
  description,
  category,
  source,
  source_ref,
  address,
  latitude,
  longitude,
  city_name,
  district_name,
  source_priority,
  created_at,
  updated_at
)
values
  ('place', 'Com Tam Ba Ghien', 'Quan com tam noi tieng voi suon nuong day, khau phan lon va luc nao cung dong khach.', 'restaurant', 'seed', 'seed:hcm:com-tam-ba-ghien', '84 Dang Van Ngu, Phuong 10, Phu Nhuan, Ho Chi Minh City', 10.799100, 106.677700, 'Ho Chi Minh City', 'Phu Nhuan', 35, now() - interval '40 days', now()),
  ('place', 'Pho Le Nguyen Trai', 'Diem an pho lau doi o khu Nguyen Trai, thuong duoc nhac den boi nuoc dung dam va thit bo day dan.', 'restaurant', 'seed', 'seed:hcm:pho-le-nguyen-trai', '413-415 Nguyen Trai, Ward 7, District 5, Ho Chi Minh City', 10.757400, 106.681200, 'Ho Chi Minh City', 'District 5', 35, now() - interval '40 days', now()),
  ('place', 'Banh Mi Huynh Hoa', 'Xe banh mi noi tieng o trung tam thanh pho, phu hop de test search theo ten rieng va review ngan canh tranh cao.', 'restaurant', 'seed', 'seed:hcm:banh-mi-huynh-hoa', '26 Le Thi Rieng, Ben Thanh, District 1, Ho Chi Minh City', 10.771100, 106.690300, 'Ho Chi Minh City', 'District 1', 35, now() - interval '40 days', now()),
  ('place', 'Oc Dao Nguyen Trai', 'Quan oc noi tieng, hop cho bo du lieu map vi co luong review thuc te da dang va gio dong khach rat ro.', 'restaurant', 'seed', 'seed:hcm:oc-dao-nguyen-trai', '132 Nguyen Trai, Ben Thanh, District 1, Ho Chi Minh City', 10.769100, 106.685800, 'Ho Chi Minh City', 'District 1', 35, now() - interval '40 days', now()),
  ('place', 'Pizza 4Ps Le Thanh Ton', 'Chi nhanh duoc nhac den nhieu cua Pizza 4Ps, phu hop de seed nhom nguoi dung thich review theo trai nghiem tong the.', 'restaurant', 'seed', 'seed:hcm:pizza-4ps-le-thanh-ton', '8/15 Le Thanh Ton, Ben Nghe, District 1, Ho Chi Minh City', 10.781900, 106.706700, 'Ho Chi Minh City', 'District 1', 35, now() - interval '40 days', now())
on conflict (source, source_ref) do update
set name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    city_name = excluded.city_name,
    district_name = excluded.district_name,
    source_priority = excluded.source_priority,
    updated_at = excluded.updated_at;

insert into public.context_reviews (
  context_id,
  user_id,
  stars,
  comment,
  status,
  created_at,
  updated_at
)
values
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:com-tam-ba-ghien'), (select id from public.users where email = 'an.nguyen.seed@mock.local'), 5, public.make_mock_food_review('Com Tam Ba Ghien', 'suon nuong', 'mieng suon day, mem va co mui than nuong rat ro nhung khong bi kho', 'toc do ra mon nhanh, nhan vien quen nhiep quan dong nen thao tac gon', 'gio trua rat dong va viec tim cho de xe can tinh truoc', 'truoc 11h30 hoac sau 13h30', 'khau phan lon, an no lau va hop voi nguoi muon mot bua trua chac da'), 'published', now() - interval '35 days', now() - interval '35 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:com-tam-ba-ghien'), (select id from public.users where email = 'minh.tran.seed@mock.local'), 5, public.make_mock_food_review('Com Tam Ba Ghien', 'com tam va suon bi cha', 'hat com roi vua, suon dam vi, cha trung giu duoc do mem va de an', 'phuc vu thang tay, it hoa my nhung du nhanh de khach khong met', 'neu di nhom dong nguoi nen chia nguoi vao goi mon de tranh chen o quay', '10h45 den 11h15', 'gia khong re theo kieu binh dan nhat nhung doi lai la su on dinh va do no cao'), 'published', now() - interval '29 days', now() - interval '29 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:com-tam-ba-ghien'), (select id from public.users where email = 'ha.le.seed@mock.local'), 4, public.make_mock_food_review('Com Tam Ba Ghien', 'suon nuong nguyen mieng', 'vi ngot man can bang, phan mo va nac di cung nhau nen an khong bi khat ngay', 'ban ghe xoay vong nhanh, khach vao ra lien tuc nhung van giu duoc nhip', 'luc cao diem hoi on va nguoi lan dau den co the thay ap luc vi dong', 'sang tre den dau trua', 'phu hop voi nguoi muon mot dia chi co ten tuoi de dua vao bo review am thuc Sai Gon'), 'published', now() - interval '22 days', now() - interval '22 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:com-tam-ba-ghien'), (select id from public.users where email = 'quang.pham.seed@mock.local'), 4, public.make_mock_food_review('Com Tam Ba Ghien', 'suon nuong va nuoc mam', 'nuoc mam co vai tro rat quan trong, giup tong the dia com ro net va de nho hon', 'nhan su khong qua vui ve nhung lam viec ro rang va khong de khach cho vo ly', 'cuoi tuan luong khach cao hon ngay thuong nen nen di lech khung gio an chinh', 'sau 13h15', 'gia tri nam o su dong deu qua nhieu lan ghe, khong chi o do hot cua ten quan'), 'published', now() - interval '15 days', now() - interval '15 days'),

  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pho-le-nguyen-trai'), (select id from public.users where email = 'quang.pham.seed@mock.local'), 5, public.make_mock_food_review('Pho Le Nguyen Trai', 'pho tai nam', 'nuoc dung dam, beo vua phai va mui bo rat ro ngay tu hoi dau tien', 'nhan vien nhin chung quen quy trinh, mon nuoc ra deu va giu nhiet do tot', 'buoi toi khach rat dong, nhat la ngay cuoi tuan', '7h00 den 8h30 hoac truoc 18h00', 'gia tri cua to pho nam o nuoc dung co ban sac va thi thoang van muon quay lai de doi chieu cam nhan'), 'published', now() - interval '34 days', now() - interval '34 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pho-le-nguyen-trai'), (select id from public.users where email = 'thao.vo.seed@mock.local'), 5, public.make_mock_food_review('Pho Le Nguyen Trai', 'pho dac biet', 'thit bo day dan, banh pho mem va khong bi nat, nuoc dung de lai hau vi tot', 'khach dong nhung to chuc cho ngoi van kha tru tru, phuc vu khong vo van', 'nen canh vi tri de xe va chuan bi tam ly xep hang ngan', 'sang som hoac giua chieu', 'neu review cho nguoi ngoai thanh pho thi day la dia chi de gioi thieu vi muc do nhan dien cao'), 'published', now() - interval '27 days', now() - interval '27 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pho-le-nguyen-trai'), (select id from public.users where email = 'linh.dang.seed@mock.local'), 4, public.make_mock_food_review('Pho Le Nguyen Trai', 'nuoc dung va thit bo', 'diem manh lon nhat la mui thom va do day cua nuoc, it bi nhat nhay giua cac lan den', 'phuc vu nhanh, giao tiep ngan gon, phu hop voi nhom khach den de an va roi di tiep', 'vao khung 18h30 tro di thuong dong va de anh huong toi trai nghiem nguoi moi', '7h den 9h sang', 'gia co the cao hon mot so quan pho quen thuoc nhung doi lai la ten tuoi va do on dinh'), 'published', now() - interval '20 days', now() - interval '20 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pho-le-nguyen-trai'), (select id from public.users where email = 'yen.ho.seed@mock.local'), 4, public.make_mock_food_review('Pho Le Nguyen Trai', 'tai, nam va nuoc dung', 'tong the bo phan chinh va phu duoc ghep lai hop ly, an xong khong thay bi gat', 'nhan vien va bep phoi hop kha tot trong khung gio dong, mon ra lien mach', 'di theo cap doi hoac nhom nho de de co cho ngoi va de chia se cam nhan', 'sau 14h30', 'day la dia chi phu hop cho bo du lieu mau vi co tinh dai dien va de search theo ten rieng'), 'published', now() - interval '13 days', now() - interval '13 days'),

  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:banh-mi-huynh-hoa'), (select id from public.users where email = 'ha.le.seed@mock.local'), 5, public.make_mock_food_review('Banh Mi Huynh Hoa', 'banh mi thap cam', 'nhan day, vi beo va dam, an xong de nho vi tong the rat manh', 'hang doi co the dai nhung quy trinh ban ra lien tuc nen toc do giai phong khach kha tot', 'can xac dinh truoc la day la kieu mua mang di va doi hang hon la ngoi lai an', 'truoc 17h30 hoac sau 20h00', 'muc gia cao hon banh mi thong thuong nhung phan nhan day va tinh bieu tuong thuong hieu bu lai'), 'published', now() - interval '33 days', now() - interval '33 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:banh-mi-huynh-hoa'), (select id from public.users where email = 'khanh.bui.seed@mock.local'), 4, public.make_mock_food_review('Banh Mi Huynh Hoa', 'banh mi va patê', 'do day cua nhan va lop gia vi tao ra cam giac no rat nhanh, mui vi de phan biet', 'nhan vien thao tac nhanh va chuan, khong co nhieu khoang trong trong gio cao diem', 'neu can review cong bang thi nen an tai cho gan do sau khi mua de cam nhan vo banh va nhiet do tot nhat', '17h den 18h', 'day la diem phu hop de test search theo tu khoa noi tieng va y kien trai chieu ve gia tri gia tien'), 'published', now() - interval '26 days', now() - interval '26 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:banh-mi-huynh-hoa'), (select id from public.users where email = 'an.nguyen.seed@mock.local'), 4, public.make_mock_food_review('Banh Mi Huynh Hoa', 'banh mi dac trung trung tam', 'diem nhan la nhan phong phu va lop sot tao ra mau vi rat ro, kho quen', 'co do ap luc do dong khach nhung quy trinh van giu duoc su ro rang', 'nguoi moi den nen chap nhan viec xep hang nhu mot phan cua trai nghiem', 'sau 20h30', 'gia tri review nam o viec giai thich ro vi sao mot tiem banh mi lai tao duoc suc hut lau den vay'), 'published', now() - interval '19 days', now() - interval '19 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:banh-mi-huynh-hoa'), (select id from public.users where email = 'thao.vo.seed@mock.local'), 5, public.make_mock_food_review('Banh Mi Huynh Hoa', 'banh mi thap cam nong', 'neu an luc vua mua xong thi vo banh va nhan cho tra lai trai nghiem manh hon ro ret', 'toi danh gia cao toc do phuc vu va viec giu nhiet mon trong boi canh khach rat dong', 'nhom di chung nen cu mot nguoi xep hang, nhung nguoi khac tim cho dung hop ly', 'truoc 17h00', 'de dung lam moc so sanh cho cac tiem banh mi trung tam co muc gia cao'), 'published', now() - interval '11 days', now() - interval '11 days'),

  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:oc-dao-nguyen-trai'), (select id from public.users where email = 'linh.dang.seed@mock.local'), 5, public.make_mock_food_review('Oc Dao Nguyen Trai', 'oc huong va cac mon sot', 'do tuoi va phan sot la hai thu giu chan nguoi an, tong the de chuyen thanh review co chi tiet', 'phuc vu theo nhip quan dong, co luc doi mon nhung nhin chung van chap nhan duoc', 'nen di som hon gio toi vi sau 19h thuong rat kin cho', '17h00 den 18h15', 'di nhom 3-5 nguoi la hop ly nhat vi de goi da dang mon va co so sanh ro rang'), 'published', now() - interval '31 days', now() - interval '31 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:oc-dao-nguyen-trai'), (select id from public.users where email = 'yen.ho.seed@mock.local'), 4, public.make_mock_food_review('Oc Dao Nguyen Trai', 'oc va nuoc cham', 'moi nguoi co the thich mon khac nhau nhung diem chung la mui vi rat de nho va kha bat trend review', 'khong gian nhon nhip, khong phai noi de tam su lau nhung hop voi nhom ban tre', 'gio cao diem de phai cho ban va cho mon lau hon mong doi', 'truoc 18h hoac sau 20h30', 'gia tri nam o trai nghiem tong the va su da dang, khong chi o mot mon don le'), 'published', now() - interval '24 days', now() - interval '24 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:oc-dao-nguyen-trai'), (select id from public.users where email = 'minh.tran.seed@mock.local'), 4, public.make_mock_food_review('Oc Dao Nguyen Trai', 'oc sot bo toi', 'neu mon len dung luc va an khi con nong thi cam nhan vi manh va de tao ky uc vi giac', 'nhan su dieu phoi kha nhanh du trong boi canh nhieu ban va luong goi mon phuc tap', 'nen goi theo nhip, khong nen dat qua nhieu mon cung luc neu muon review chi tiet tung mon', '17h30 den 18h30', 'phu hop lam du lieu map vi ten quan duoc tim kiem nhieu va co kha nang tao luot luu, route, save'), 'published', now() - interval '17 days', now() - interval '17 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:oc-dao-nguyen-trai'), (select id from public.users where email = 'quang.pham.seed@mock.local'), 5, public.make_mock_food_review('Oc Dao Nguyen Trai', 'cac mon oc sot cay', 'su khac biet den tu cach nem va do tuoi nguyen lieu, an vao de biet quan co ban sac rieng', 'khach dong nhung van co the doi nhan su goi y mon kha nhanh neu hoi dung nguoi', 'neu muon chup hinh va ghi note review thi nen tranh gio qua dong', 'sau 20h45', 'gia tri cua quan nam o viec gom duoc nhieu nhom khach: dan dia phuong, du khach va ca nhom review am thuc'), 'published', now() - interval '9 days', now() - interval '9 days'),

  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pizza-4ps-le-thanh-ton'), (select id from public.users where email = 'thao.vo.seed@mock.local'), 5, public.make_mock_food_review('Pizza 4Ps Le Thanh Ton', 'pizza pho mai tuoi', 'mui vi can bang, de tiep can va phan nguyen lieu duoc trinh bay ro rang', 'phuc vu chuyen nghiep hon mat bang chung, phu hop voi bua an gap go va review tong the trai nghiem', 'gio toi va cuoi tuan thuong kin lich, nen dat truoc neu di nhom', '11h00 den 12h00 hoac 14h00 den 17h00', 'gia cao hon nhieu dia chi pho thong nhung bu lai bang tinh on dinh, khong gian va chat luong phuc vu'), 'published', now() - interval '30 days', now() - interval '30 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pizza-4ps-le-thanh-ton'), (select id from public.users where email = 'linh.dang.seed@mock.local'), 5, public.make_mock_food_review('Pizza 4Ps Le Thanh Ton', 'pizza va pasta', 'tong the thuc don phu hop de nhom ban chia se, moi mon deu co diem de mo ta ro trong review', 'nhan vien chu dong, thai do on va de tao cam giac trai nghiem tron ven', 'nen dat ban online truoc neu muon chu dong thoi gian', 'trua ngay thuong', 'day la dia chi tot de lam moc tham chieu cho nhom review theo tieu chi chat luong dich vu va khong gian'), 'published', now() - interval '23 days', now() - interval '23 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pizza-4ps-le-thanh-ton'), (select id from public.users where email = 'yen.ho.seed@mock.local'), 4, public.make_mock_food_review('Pizza 4Ps Le Thanh Ton', 'pho mai tuoi va de banh', 'cam nhan de an, khong qua nang, hop voi nguoi muon mot bua an de tro chuyen va danh gia tong the', 'dich vu tot, thoi gian cho mon hop ly va giai thich mon kha ro', 'gio toi cuoi tuan thuong phai dat cho, neu khong se ton nhieu thoi gian doi', 'sau 14h30 hoac dat ban truoc', 'gia tri khong nam o mon re ma o su hoan chinh cua trai nghiem va do de quay lai'), 'published', now() - interval '16 days', now() - interval '16 days'),
  ((select id from public.contexts where source = 'seed' and source_ref = 'seed:hcm:pizza-4ps-le-thanh-ton'), (select id from public.users where email = 'khanh.bui.seed@mock.local'), 4, public.make_mock_food_review('Pizza 4Ps Le Thanh Ton', 'pizza pho mai tuoi va salad', 'khau vi than thien, phan vi ro, de review cho nhieu nhom nguoi dung co nen tang khac nhau', 'nhan vien va quy trinh ban ro rang, phu hop voi nhung review uu tien su on dinh', 'neu muon ghi note chi tiet thi bua trua ngay thuong la de quan sat nhat', '11h30 den 13h00', 'phu hop cho dataset vi ket hop duoc yeu to am thuc, khong gian, dich vu va hanh vi dat ban'), 'published', now() - interval '8 days', now() - interval '8 days')
on conflict (context_id, user_id) do update
set stars = excluded.stars,
    comment = excluded.comment,
    status = excluded.status,
    updated_at = excluded.updated_at;

do $$
declare
  v_context_id integer;
begin
  for v_context_id in
    select id
    from public.contexts
    where source = 'seed'
      and source_ref like 'seed:hcm:%'
  loop
    perform public.recalculate_context_review_stats(v_context_id);
    perform public.refresh_context_search_document(v_context_id);
  end loop;
end;
$$;

select public.refresh_all_search_documents();
