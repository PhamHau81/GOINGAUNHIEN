import { Student, Question, AppSettings, ClassRoom } from '../types';

export const DEFAULT_STUDENTS_TEXT = `Nguyễn Hoàng Nam
Lê Trần Bảo Anh
Trần Minh Quân
Vũ Thùy Chi
Đỗ Gia Huy
Phạm Quỳnh Trang
Hoàng Đức Anh
Ngô Phương Linh
Bùi Quang Khải
Đặng Khánh Huyền
Phan Tuấn Kiệt
Lý Diệu Anh
Dương Thái Sơn
Mai Thanh Hằng
Trịnh Tiến Dũng
Hà Nhật Minh
Lâm Ngọc Ánh
Đoàn Quốc Bảo
Trương Hải Yến
Võ Nguyên Khang
Nguyễn Thảo My
Lê Hoàng Long
Phùng Tuấn Anh
Chu Minh Châu
Tô Khánh An
Lương Đình Trọng
Vũ Kiều Oanh
Đinh Thế Vinh
Tạ Minh Hiếu
Bạch Lan Hương`;

export const CLASS_11A2_TEXT = `Trần Quốc Anh
Nguyễn Mai Chi
Hoàng Văn Cường
Lê Thị Dung
Phạm Minh Đức
Vũ Hoàng Giang
Đỗ Hương Giang
Ngô Tuấn Hải
Đặng Ngọc Hân
Bùi Trọng Hiếu
Lý Thu Hoài
Dương Quốc Huy
Trịnh Khánh Linh
Hà Đức Long
Lâm Thùy Linh
Đoàn Hải Nam
Trương Quỳnh Nga
Võ Minh Nhật
Nguyễn Yến Nhi
Lê Hồng Phong
Phùng Bảo Quyên
Chu Tuấn Thành
Tô Minh Trang
Lương Diệu Tú
Vũ Anh Tuấn
Đinh Cẩm Vân`;

export const CLASS_12A1_TEXT = `Phạm Quang Dũng
Trần Bảo Hân
Nguyễn Minh Khang
Lê Thị Thảo Linh
Vũ Hoàng Nam
Hoàng Yến My
Đỗ Gia Phúc
Ngô Phương Thảo
Bùi Văn Tiến
Đặng Hải Triều
Phan Tuấn Tú
Lý Minh Uyên
Dương Bích Vân
Mai Thế Vũ
Trịnh Lan Anh
Hà Ngọc Bích
Lâm Đức Cảnh
Đoàn Thúy Diễm
Trương Gia Hưng
Võ Thùy Hương
Nguyễn Đình Khôi
Lê Kiều Nga
Phùng Hồng Nhung
Chu Thành Phát
Tô Quang Sáng
Lương Hải Sơn
Vũ Tuyết Mai
Đinh Minh Trí`;

export const parseStudentsFromText = (text: string): Student[] => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rankTitles = [
    'Học sinh tích cực',
    'Ngôi sao chăm chỉ',
    'Cây toán cừ khôi',
    'Nhà thông thái trẻ',
    'Chiến binh học tập',
    'Tài năng sáng tạo',
    'Đại sứ tự tin',
    'Học sinh xuất sắc',
  ];

  return lines.map((name, index) => ({
    id: `student-${index + 1}-${name.replace(/\s+/g, '-').toLowerCase()}`,
    name,
    avatarSeed: (index * 7 + 13) % 100,
    callCount: 0,
    rankTitle: rankTitles[index % rankTitles.length],
  }));
};

export const DEFAULT_CLASSES: ClassRoom[] = [
  {
    id: 'class-10a1',
    name: 'Lớp 10A1',
    grade: 10,
    students: parseStudentsFromText(DEFAULT_STUDENTS_TEXT),
    note: 'Lớp 10 Ban Tự nhiên - Toán Kết nối tri thức',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'class-11a2',
    name: 'Lớp 11A2',
    grade: 11,
    students: parseStudentsFromText(CLASS_11A2_TEXT),
    note: 'Lớp 11 Nâng cao - Toán Tin',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'class-12a1',
    name: 'Lớp 12A1',
    grade: 12,
    students: parseStudentsFromText(CLASS_12A1_TEXT),
    note: 'Lớp 12 Khóa 2024-2025 Luyện thi THPT Quốc Gia',
    createdAt: Date.now() - 86400000,
  },
];

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    number: 1,
    planetName: 'Mặt Trời (Sun)',
    planetType: 'sun',
    title: 'Mặt Trời là loại thiên thể nào trong vũ trụ?',
    options: [
      { key: 'A', text: 'Hành tinh khí khổng lồ' },
      { key: 'B', text: 'Một ngôi sao lùn vàng' },
      { key: 'C', text: 'Vệ tinh tự nhiên của Dải Ngân Hà' },
      { key: 'D', text: 'Tiểu hành tinh phát sáng' },
    ],
    correctAnswer: 'B',
    explanation: 'Mặt Trời là một ngôi sao thuộc dãy chính kiểu quang phổ G2V, thường được gọi là sao lùn vàng.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-2',
    number: 2,
    planetName: 'Sao Thủy (Mercury)',
    planetType: 'mercury',
    title: 'Hành tinh nào nằm gần Mặt Trời nhất trong Hệ Mặt Trời?',
    options: [
      { key: 'A', text: 'Sao Thủy' },
      { key: 'B', text: 'Sao Kim' },
      { key: 'C', text: 'Sao Hỏa' },
      { key: 'D', text: 'Trái Đất' },
    ],
    correctAnswer: 'A',
    explanation: 'Sao Thủy (Mercury) là hành tinh gần Mặt Trời nhất với khoảng cách trung bình khoảng 58 triệu km.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-3',
    number: 3,
    planetName: 'Sao Kim (Venus)',
    planetType: 'venus',
    title: 'Hành tinh nào có nhiệt độ bề mặt nóng nhất trong Hệ Mặt Trời?',
    options: [
      { key: 'A', text: 'Sao Thủy' },
      { key: 'B', text: 'Sao Kim' },
      { key: 'C', text: 'Sao Mộc' },
      { key: 'D', text: 'Mặt Trăng' },
    ],
    correctAnswer: 'B',
    explanation: 'Dù Sao Thủy gần Mặt Trời hơn, nhưng Sao Kim mới nóng nhất (khoảng 465°C) do hiệu ứng nhà kính dày đặc từ khí CO2.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-4',
    number: 4,
    planetName: 'Trái Đất (Earth)',
    planetType: 'earth',
    title: 'Khí nào chiếm tỷ lệ thể tích lớn nhất trong bầu khí quyển Trái Đất?',
    options: [
      { key: 'A', text: 'Khí Ô-xi (O2)' },
      { key: 'B', text: 'Khí Nitơ (N2)' },
      { key: 'C', text: 'Khí Carbonic (CO2)' },
      { key: 'D', text: 'Khí Hydro (H2)' },
    ],
    correctAnswer: 'B',
    explanation: 'Bầu khí quyển Trái Đất gồm khoảng 78% Nitơ, 21% Ô-xi và 1% các loại khí khác.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-5',
    number: 5,
    planetName: 'Mặt Trăng (Moon)',
    planetType: 'moon',
    title: 'Ai là người đầu tiên trong lịch sử nhân loại đặt chân lên Mặt Trăng (năm 1969)?',
    options: [
      { key: 'A', text: 'Yuri Gagarin' },
      { key: 'B', text: 'Neil Armstrong' },
      { key: 'C', text: 'Buzz Aldrin' },
      { key: 'D', text: 'Phạm Tuân' },
    ],
    correctAnswer: 'B',
    explanation: 'Neil Armstrong bước xuống bề mặt Mặt Trăng ngày 20/7/1969 trong sứ mệnh Apollo 11.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-6',
    number: 6,
    planetName: 'Sao Hỏa (Mars)',
    planetType: 'mars',
    title: 'Tại sao Sao Hỏa lại có màu đỏ đặc trưng khi quan sát từ không gian?',
    options: [
      { key: 'A', text: 'Do có nhiều dung nham núi lửa đang phun' },
      { key: 'B', text: 'Do bề mặt chứa nhiều oxit sắt (rỉ sét)' },
      { key: 'C', text: 'Do ánh sáng Mặt Trời phản chiếu qua mây bụi' },
      { key: 'D', text: 'Do nước biển màu đỏ' },
    ],
    correctAnswer: 'B',
    explanation: 'Bụi và đá trên bề mặt Sao Hỏa rất giàu oxit sắt (Fe2O3), khiến nó có màu đỏ cam như rỉ sét.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-7',
    number: 7,
    planetName: 'Sao Mộc (Jupiter)',
    planetType: 'jupiter',
    title: 'Hành tinh nào có kích thước và khối lượng lớn nhất trong Hệ Mặt Trời?',
    options: [
      { key: 'A', text: 'Sao Thổ' },
      { key: 'B', text: 'Sao Thiên Vương' },
      { key: 'C', text: 'Sao Mộc' },
      { key: 'D', text: 'Sao Hải Vương' },
    ],
    correctAnswer: 'C',
    explanation: 'Sao Mộc (Jupiter) có khối lượng gấp 2.5 lần tổng khối lượng của tất cả các hành tinh khác cộng lại.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-8',
    number: 8,
    planetName: 'Sao Thổ (Saturn)',
    planetType: 'saturn',
    title: 'Vành đai tráng lệ nổi tiếng của Sao Thổ được cấu tạo chủ yếu từ gì?',
    options: [
      { key: 'A', text: 'Băng đá, bụi và các mảnh vụn đá' },
      { key: 'B', text: 'Khí gas phát quang' },
      { key: 'C', text: 'Kim cương rắn nổi lơ lửng' },
      { key: 'D', text: 'Kim loại vàng và bạc lỏng' },
    ],
    correctAnswer: 'A',
    explanation: 'Vành đai Sao Thổ gồm vô số hạt băng nước tinh khiết (99%) với kích thước từ hạt cát đến tảng băng khổng lồ.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-9',
    number: 9,
    planetName: 'Sao Thiên Vương (Uranus)',
    planetType: 'uranus',
    title: 'Sao Thiên Vương có đặc điểm quay quanh trục vô cùng kỳ lạ nào?',
    options: [
      { key: 'A', text: 'Trục quay nghiêng gần như nằm ngang (khoảng 98°)' },
      { key: 'B', text: 'Nó không hề tự quay quanh trục' },
      { key: 'C', text: 'Quay nhanh nhất vũ trụ (1 giây 1 vòng)' },
      { key: 'D', text: 'Tự đảo cực 10 phút một lần' },
    ],
    correctAnswer: 'A',
    explanation: 'Sao Thiên Vương "lăn" trên quỹ đạo vì trục tự quay nghiêng tới 97.77 độ, gần như song song với mặt phẳng hoàng đạo.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-10',
    number: 10,
    planetName: 'Sao Hải Vương (Neptune)',
    planetType: 'neptune',
    title: 'Hành tinh nào có những cơn gió bão di chuyển với tốc độ khủng khiếp nhất Hệ Mặt Trời (lên tới 2.100 km/h)?',
    options: [
      { key: 'A', text: 'Sao Hỏa' },
      { key: 'B', text: 'Sao Hải Vương' },
      { key: 'C', text: 'Trái Đất' },
      { key: 'D', text: 'Sao Thủy' },
    ],
    correctAnswer: 'B',
    explanation: 'Sao Hải Vương ghi nhận những cơn gió siêu thanh mạnh nhất trong Hệ Mặt Trời, đạt vận tốc hơn 2.000 km/h.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-11',
    number: 11,
    planetName: 'Tiểu Hành Tinh Ceres',
    planetType: 'asteroid',
    title: 'Vành đai tiểu hành tinh chính của Hệ Mặt Trời nằm giữa quỹ đạo của 2 hành tinh nào?',
    options: [
      { key: 'A', text: 'Trái Đất và Sao Hỏa' },
      { key: 'B', text: 'Sao Hỏa và Sao Mộc' },
      { key: 'C', text: 'Sao Mộc và Sao Thổ' },
      { key: 'D', text: 'Sao Thủy và Sao Kim' },
    ],
    correctAnswer: 'B',
    explanation: 'Vành đai tiểu hành tinh nằm giữa quỹ đạo của Sao Hỏa và Sao Mộc, chứa hàng triệu tiểu hành tinh.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-12',
    number: 12,
    planetName: 'Sao Chổi Halley (Comet)',
    planetType: 'comet',
    title: 'Sao chổi Halley nổi tiếng quay trở lại và có thể nhìn thấy từ Trái Đất theo chu kỳ khoảng bao nhiêu năm?',
    options: [
      { key: 'A', text: 'Khoảng 12 năm' },
      { key: 'B', text: 'Khoảng 75 - 76 năm' },
      { key: 'C', text: 'Khoảng 150 năm' },
      { key: 'D', text: 'Khoảng 365 năm' },
    ],
    correctAnswer: 'B',
    explanation: 'Sao chổi Halley xuất hiện định kỳ mỗi 75-76 năm một lần. Lần xuất hiện tiếp theo dự kiến vào năm 2061.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-13',
    number: 13,
    planetName: 'Siêu Tân Tinh (Supernova)',
    planetType: 'supernova',
    title: 'Hiện tượng "Siêu tân tinh" (Supernova) là gì?',
    options: [
      { key: 'A', text: 'Vụ nổ khổng lồ đánh dấu cái chết của một ngôi sao lớn' },
      { key: 'B', text: 'Sự va chạm giữa hai vệ tinh không gian' },
      { key: 'C', text: 'Mặt Trời bùng phát tia lửa cực đại' },
      { key: 'D', text: 'Một hành tinh mới ra đời từ khí hydro' },
    ],
    correctAnswer: 'A',
    explanation: 'Siêu tân tinh là vụ nổ mãnh liệt ở giai đoạn cuối đời của một ngôi sao nặng, giải phóng năng lượng bằng cả thiên hà.',
    points: 100,
    isAnswered: false,
  },
  {
    id: 'q-14',
    number: 14,
    planetName: 'Hố Đen Vũ Trụ (Black Hole)',
    planetType: 'blackhole',
    title: 'Tại sao ngay cả ánh sáng cũng không thể thoát ra khỏi Hố Đen?',
    options: [
      { key: 'A', text: 'Do nhiệt độ quá lạnh đóng băng photon' },
      { key: 'B', text: 'Do lực hấp dẫn cực kỳ mạnh bẻ cong không thời gian' },
      { key: 'C', text: 'Do bên trong hố đen có lớp gương phản xạ ngược' },
      { key: 'D', text: 'Do từ trường điện tích âm triệt tiêu quang phổ' },
    ],
    correctAnswer: 'B',
    explanation: 'Khối lượng hố đen cô đặc vào thể tích cực nhỏ tạo nên lực hấp dẫn mạnh đến mức vận tốc vũ trụ cấp 2 vượt quá tốc độ ánh sáng.',
    points: 100,
    isAnswered: false,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  scanDurationSeconds: 4,
  questionDurationSeconds: 20,
  soundEnabled: true,
  soundVolume: 0.7,
  ambientSoundEnabled: false,
  autoSpeakName: true,
  callMode: 'radar',
};
