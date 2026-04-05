import { createClient } from "@/lib/supabase/server";

const OPENERS = [
  "Tình yêu không cần ồn ào, chỉ cần có mặt đúng lúc.",
  "Mỗi ngày bên nhau là một lần học cách dịu dàng hơn.",
  "Điều đẹp nhất của tình yêu là được kể tiếp câu chuyện của hai người.",
  "Một cái nắm tay đủ để ngày dài trở nên nhẹ hơn.",
  "Bình yên thường bắt đầu từ một tin nhắn rất nhỏ.",
  "Không phải lúc nào cũng hoàn hảo, nhưng luôn là thật lòng.",
  "Tình yêu bền nhất là thứ vẫn ấm dù đã đi qua nhiều mùa.",
  "Những điều nhỏ xíu cũng có thể làm tim mình đầy lên.",
  "Cảm xúc đẹp nhất là khi được ai đó nhớ tới ngay cả lúc bận rộn.",
  "Hạnh phúc đôi khi chỉ là cùng nhau đi qua một ngày bình thường.",
  "Một nụ cười đúng lúc có thể làm dịu cả thế giới.",
  "Tình yêu tốt là thứ khiến mình muốn trở thành phiên bản tử tế hơn.",
  "Có những ngày chẳng cần gì nhiều ngoài sự hiện diện của nhau.",
  "Một kỷ niệm đẹp thường bắt đầu bằng một khoảnh khắc rất ngẫu nhiên.",
  "Yêu nhau là cùng giữ cho những điều bé nhỏ luôn có ý nghĩa.",
  "Chăm chút cho nhau là một cách nói 'mình ở đây'.",
  "Mỗi lần nhớ nhau là một lần trái tim học cách chờ đợi.",
  "Sự dịu dàng là ngôn ngữ riêng của hai người thương nhau.",
  "Tình yêu đẹp không cần phải giống ai khác.",
  "Dành cho nhau thời gian là cách yêu chân thành nhất.",
];

const ENDINGS = [
  "Hôm nay, hãy nói một câu ấm áp trước khi ngủ.",
  "Và đừng quên ôm nhau lâu hơn một chút.",
  "Rồi để mọi chuyện nhỏ lại trước một nụ cười.",
  "Ngay cả một lời hỏi thăm cũng đủ làm tim ấm lên.",
  "Nếu được, hãy hẹn nhau một buổi tối thật chậm.",
  "Chỉ cần vậy thôi, ngày hôm nay đã đáng nhớ hơn rồi.",
  "Đừng giữ im lặng quá lâu khi mình có thể nói nhớ.",
  "Hãy để một kỷ niệm mới đi vào cuốn album chung.",
  "Vì những điều giản dị luôn là thứ bền nhất.",
  "Một tin nhắn ngắn cũng có thể thành niềm vui lớn.",
  "Hãy cùng nhau tạo thêm một khoảnh khắc đáng nhớ nhé.",
  "Yêu nhau là cùng nhau đi chậm mà vẫn đi xa.",
  "Nên cứ từ tốn, vì điều đẹp thường nở rất chậm.",
  "Và nhắc nhau rằng mình vẫn luôn là nhà của nhau.",
  "Bởi một ngày tốt là ngày hai người không quên nhau.",
  "Thế là đủ để biến hôm nay thành một ngày dịu dàng.",
  "Hãy giữ cho trái tim luôn có chỗ cho sự tử tế.",
  "Rồi mọi thứ sẽ nhẹ hơn rất nhiều.",
  "Một cái chạm tay đúng lúc luôn có phép màu riêng.",
  "Hãy để tình yêu đi cùng những thói quen nhỏ tốt lành.",
];

function buildFallbackQuotes() {
  const quotes: string[] = [];
  for (const opener of OPENERS) {
    for (const ending of ENDINGS) {
      quotes.push(`${opener} ${ending}`);
    }
  }
  return quotes;
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("daily_quotes").select("body,sort_order").order("sort_order", { ascending: true });

  if (error || !data?.length) {
    return Response.json({ quotes: buildFallbackQuotes(), total: 400, source: "fallback" }, { status: 200 });
  }

  return Response.json(
    {
      quotes: data.map((item) => item.body),
      total: data.length,
      source: "database",
    },
    { status: 200 },
  );
}
