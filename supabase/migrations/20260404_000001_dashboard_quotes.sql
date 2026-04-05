create table if not exists public.daily_quotes (
  id uuid primary key default gen_random_uuid(),
  body text not null unique,
  sort_order int not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_daily_quotes_sort_order on public.daily_quotes(sort_order);

with openers(opener, oidx) as (
  values
    ('Tình yêu không cần ồn ào, chỉ cần có mặt đúng lúc.', 1),
    ('Mỗi ngày bên nhau là một lần học cách dịu dàng hơn.', 2),
    ('Điều đẹp nhất của tình yêu là được kể tiếp câu chuyện của hai người.', 3),
    ('Một cái nắm tay đủ để ngày dài trở nên nhẹ hơn.', 4),
    ('Bình yên thường bắt đầu từ một tin nhắn rất nhỏ.', 5),
    ('Không phải lúc nào cũng hoàn hảo, nhưng luôn là thật lòng.', 6),
    ('Tình yêu bền nhất là thứ vẫn ấm dù đã đi qua nhiều mùa.', 7),
    ('Những điều nhỏ xíu cũng có thể làm tim mình đầy lên.', 8),
    ('Cảm xúc đẹp nhất là khi được ai đó nhớ tới ngay cả lúc bận rộn.', 9),
    ('Hạnh phúc đôi khi chỉ là cùng nhau đi qua một ngày bình thường.', 10),
    ('Một nụ cười đúng lúc có thể làm dịu cả thế giới.', 11),
    ('Tình yêu tốt là thứ khiến mình muốn trở thành phiên bản tử tế hơn.', 12),
    ('Có những ngày chẳng cần gì nhiều ngoài sự hiện diện của nhau.', 13),
    ('Một kỷ niệm đẹp thường bắt đầu bằng một khoảnh khắc rất ngẫu nhiên.', 14),
    ('Yêu nhau là cùng giữ cho những điều bé nhỏ luôn có ý nghĩa.', 15),
    ('Chăm chút cho nhau là một cách nói ''mình ở đây''.', 16),
    ('Mỗi lần nhớ nhau là một lần trái tim học cách chờ đợi.', 17),
    ('Sự dịu dàng là ngôn ngữ riêng của hai người thương nhau.', 18),
    ('Tình yêu đẹp không cần phải giống ai khác.', 19),
    ('Dành cho nhau thời gian là cách yêu chân thành nhất.', 20)
),
endings(ending, eidx) as (
  values
    ('Hôm nay, hãy nói một câu ấm áp trước khi ngủ.', 1),
    ('Và đừng quên ôm nhau lâu hơn một chút.', 2),
    ('Rồi để mọi chuyện nhỏ lại trước một nụ cười.', 3),
    ('Ngay cả một lời hỏi thăm cũng đủ làm tim ấm lên.', 4),
    ('Nếu được, hãy hẹn nhau một buổi tối thật chậm.', 5),
    ('Chỉ cần vậy thôi, ngày hôm nay đã đáng nhớ hơn rồi.', 6),
    ('Đừng giữ im lặng quá lâu khi mình có thể nói nhớ.', 7),
    ('Hãy để một kỷ niệm mới đi vào cuốn album chung.', 8),
    ('Vì những điều giản dị luôn là thứ bền nhất.', 9),
    ('Một tin nhắn ngắn cũng có thể thành niềm vui lớn.', 10),
    ('Hãy cùng nhau tạo thêm một khoảnh khắc đáng nhớ nhé.', 11),
    ('Yêu nhau là cùng nhau đi chậm mà vẫn đi xa.', 12),
    ('Nên cứ từ tốn, vì điều đẹp thường nở rất chậm.', 13),
    ('Và nhắc nhau rằng mình vẫn luôn là nhà của nhau.', 14),
    ('Bởi một ngày tốt là ngày hai người không quên nhau.', 15),
    ('Thế là đủ để biến hôm nay thành một ngày dịu dàng.', 16),
    ('Hãy giữ cho trái tim luôn có chỗ cho sự tử tế.', 17),
    ('Rồi mọi thứ sẽ nhẹ hơn rất nhiều.', 18),
    ('Một cái chạm tay đúng lúc luôn có phép màu riêng.', 19),
    ('Hãy để tình yêu đi cùng những thói quen nhỏ tốt lành.', 20)
)
insert into public.daily_quotes (body, sort_order)
select
  openers.opener || ' ' || endings.ending,
  ((openers.oidx - 1) * 20) + endings.eidx
from openers
cross join endings
on conflict (body) do nothing;
