const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const db = require("../models");

// ----------------- Core Data Configurations -----------------
const knownDistricts = [
  "ba đình", "hoàn kiếm", "tây hồ", "long biên", "cầu giấy", "đống đa", "hai bà trưng", 
  "hoàng mai", "thanh xuân", "hà đông", "bắc từ liêm", "nam từ liêm", "sơn tây",
  "ba vì", "chương mỹ", "đan phượng", "đông anh", "gia lâm", "hoài đức", "mê linh", 
  "mỹ đức", "phú xuyên", "phúc thọ", "quốc oai", "sóc sơn", "thạch thất", "thanh oai", 
  "thanh trì", "thường tín", "ứng hoà", "mỹ đình",
  "quận 1", "quận 2", "quận 3", "quận 4", "quận 5", "quận 6", "quận 7", "quận 8",
  "quận 9", "quận 10", "quận 11", "quận 12", "bình tân", "bình thạnh", "gò vấp", 
  "phú nhuận", "tân bình", "tân phú", "thủ đức", "bình chánh", "cần giờ", "củ chi",
  "hóc môn", "nhà bè", "quận tân bình", "quận bình thạnh",
  "hải châu", "thanh khê", "sơn trà", "ngũ hành sơn", "liên chiểu", "cẩm lệ", "hòa vang",
  "hồng bàng", "lê chân", "ngô quyền", "kiến an", "hải an", "đồ sơn", "dương kinh",
  "ninh kiều", "bình thủy", "cái răng", "ô môn", "thốt nốt"
];

const cityPatterns = [
  "hà nội", "hanoi", "ha noi", "thủ đô", "thu do", "hn",
  "hồ chí minh", "ho chi minh", "tp hcm", "tphcm", "hcm", "sài gòn", "sai gon", "tp.hcm", "sg", 
  "thành phố hồ chí minh", "tp. hồ chí minh", "thanh pho ho chi minh",
  "đà nẵng", "da nang", "tp đà nẵng", "tp da nang", "tp. đà nẵng", "đn",
  "cần thơ", "can tho", "tp cần thơ", "tp can tho", "tp. cần thơ", "ct",
  "hải phòng", "hai phong", "tp hải phòng", "tp hai phong", "tp. hải phòng", "hp",
  "huế", "hue", "thừa thiên huế", "thua thien hue",
  "nha trang", "khánh hòa", "khanh hoa",
  "đà lạt", "da lat", "lâm đồng", "lam dong",
  "vũng tàu", "vung tau", "bà rịa vũng tàu", "ba ria vung tau",
  "biên hòa", "bien hoa", "đồng nai", "dong nai",
  "hải dương", "hai duong",
  "hà long", "ha long", "quảng ninh", "quang ninh",
  "thái nguyên", "thai nguyen",
  "vinh", "nghệ an", "nghe an",
  "quy nhơn", "quy nhon", "bình định", "binh dinh",
  "long xuyên", "long xuyen", "an giang",
  "buôn ma thuột", "buon ma thuot", "đắk lắk", "dak lak", "daklak",
  "rạch giá", "rach gia", "kiên giang", "kien giang",
  "mỹ tho", "my tho", "tiền giang", "tien giang",
  "nam định", "nam dinh",
  "phan thiết", "phan thiet", "bình thuận", "binh thuan",
  "pleiku", "gia lai",
  "tây ninh", "tay ninh",
  "thái bình", "thai binh",
  "việt trì", "viet tri", "phú thọ", "phu tho"
];

const validHouseTypes = ['nhatro', 'phongtro', 'chungcumini', 'nhanguyencan', 'chungcu', 'canho', 'canhodichvu', 'dichvu'];

const synonyms = {
  "phòng trọ": ["nhà trọ", "phòng cho thuê", "phòng trọ", "trọ", "nhatro", "phongtro"],
  "chung cư mini": ["ccmn", "chung cư mini", "căn hộ mini", "chungcumini"],
  "nhà nguyên căn": ["nhà nguyên căn", "nhà thuê", "nhà riêng", "nhanguyencan"],
  "chung cư": ["căn hộ", "chung cư", "căn hộ chung cư", "chungcu", "canho"],
  "căn hộ dịch vụ": ["can ho dich vu", "canhodichvu", "can ho dich vu", "can ho dich vu cao cap", "dichvu"]
};

const amenitiesSynonyms = {
  "đầy đủ nội thất": ["đầy đủ nội thất", "full nội thất", "nội thất đầy đủ", "đầy đủ tiện nghi"],
  "điều hòa": ["điều hòa", "máy lạnh", "điều hoà", "máy điều hòa"],
  "máy giặt": ["máy giặt", "máy giặt chung", "máy giặt riêng"],
  "thang máy": ["thang máy", "có thang máy", "thang máy nội khu"],
  "hầm để xe": ["hầm để xe", "bãi để xe", "nhà xe", "chỗ để xe"],
  "gác lửng": ["gác lửng", "có gác", "gác"],
  "kệ bếp": ["kệ bếp", "bếp", "tủ bếp"],
  "không chung chủ": ["không chung chủ", "riêng chủ", "tự do chủ"],
  "giờ giấc tự do": ["giờ giấc tự do", "tự do giờ giấc", "không giới hạn giờ"]
};

const processKeywords = {
  "hướng dẫn đăng bài": [
    "hướng dẫn đăng bài", "cách đăng bài", "đăng bài như thế nào", 
    "hướng dẫn đăng phòng", "làm sao để đăng phòng", "đăng tin phòng", 
    "hướng dẫn đăng tin", "cách đăng tin phòng", "cách đăng tin", "đăng tin phòng như thế nào",
    "đăng tin ntn", "quy trình đăng tin", "quy trinh dang tin", "quy trình đăng bài", "quy trinh dang bai"
  ],
  "phương thức thanh toán": [
    "quy trình thanh toán", "cách thanh toán", "thanh toán như thế nào", 
    "trả tiền ra sao", "quy trình trả tiền", "thanh toán tiền phòng", "thanh toán", "trả tiền"
  ],
  "điều khoản hợp đồng": [
    "điều khoản hợp đồng", "hợp đồng thuê", "điều khoản thuê", 
    "quy định hợp đồng", "điều khoản thuê phòng", "hợp đồng thuê nhà", "hợp đồng", "điều khoản", "quy định"
  ],
  "hướng dẫn đặt phòng": [
    "hướng dẫn đặt phòng", "cách đặt phòng", "đặt phòng như thế nào",
    "hướng dẫn thuê phòng", "làm sao để thuê phòng", "đặt phòng như thế nào",
    "hướng dẫn thuê phòng", "cách thuê phòng"
  ],
  "quy trình đặt cọc": [
    "quy trình đặt cọc", "quy trinh dat coc", "đặt cọc", "dat coc",
    "cách đặt cọc", "cach dat coc", "đặt cọc như thế nào", "dat coc nhu the nao",
    "tiền cọc", "tien coc", "tiền đặt cọc", "tien dat coc",
    "cọc tiền", "coc tien", "đặt cọc phòng", "dat coc phong",
    "quy trình cọc tiền", "quy trinh coc tien", "nộp tiền cọc", "nop tien coc",
    "thanh toán tiền cọc", "thanh toan tien coc", "đặt cọc thuê phòng",
    "hướng dẫn đặt cọc", "huong dan dat coc", "quy trình giữ chỗ",
    "cách giữ chỗ", "đặt giữ chỗ", "tiền giữ chỗ", "giữ chỗ phòng"
  ],
  "Quản lý bài đăng": [
    "quản lý bài đăng", "cách quản lý bài đăng", "quản lý phòng",
    "quản lý tin đăng", "quản lý bài viết", "quản lý bài viết như thế nào",
    "quản lý bài viết", "quản lý bài viết như thế nào"
  ],
  "chính sách hoàn tiền": [
    "chính sách hoàn tiền", "cách hoàn tiền", "hoàn tiền như thế nào",
    "chính sách hoàn tiền", "hoàn tiền", "hoàn tiền như thế nào"
  ],
  "lưu ý khi đăng bài": [
    "lưu ý khi đăng bài", 
    "lưu ý khi đăng phòng", "lưu ý khi đăng tin", 
    "lưu ý", "những lưu ý khi đăng"
  ]
};

// ----------------- Helper Functions -----------------
function removeVietnameseAccents(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function normalizeLocation(text) {
  if (!text) return "";
  text = text.toLowerCase().trim();
  const quanPatterns = [
    /quận\s+(\d+)/i,
    /q\.?\s*(\d+)/i,
    /quan\s*(\d+)/i
  ];
  for (const pattern of quanPatterns) {
    const match = text.match(pattern);
    if (match) {
      return `quan${match[1]}`;
    }
  }
  let result = removeVietnameseAccents(text);
  result = result.replace(/\s+/g, "");
  return result;
}

function containsDistrictNumber(text, number) {
  if (!text) return false;
  const pattern = new RegExp(`\\bquận\\s*0*${number}\\b|\\bq\\.?\\s*0*${number}\\b`, 'i');
  return pattern.test(text);
}

function cleanLocation(loc) {
  if (!loc) return "";
  loc = loc.trim().toLowerCase();
  const match = loc.match(/quận\s+(\d+)/i);
  if (match) return `quận ${match[1]}`;
  return loc.replace(/^(quận|huyện|thành phố|tp\.?)\s*/i, "").trim();
}

function extractRadiusFromQuery(query) {
  const patterns = [
    /trong\s+(?:vòng|bán\s+kính)\s+(\d+(?:\.\d+)?)\s*(?:km|kilomet|kilometer)/i,
    /(?:bán\s+kính|khoảng\s+cách)\s+(\d+(?:\.\d+)?)\s*(?:km|kilomet|kilometer)/i,
    /cách\s+(?:khoảng|tầm)\s+(\d+(?:\.\d+)?)\s*(?:km|kilomet|kilometer)/i,
    /(\d+(?:\.\d+)?)\s*(?:km|kilomet|kilometer)/i
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return 3.0; // Bán kính mặc định 3km
}

function extractAddressFromQuery(query) {
  const patterns = [
    /(?:gần\s+địa\s+chỉ|gan\s+dia\s+chi)\s+(.+?)(?:\s+trong\s+vòng|\s+trong\s+vong|\s+trong\s+bán\s+kính|\s+trong\s+ban\s+kinh|\s+với|\s+voi|\s+có|\s+co|\s+giá|\s+gia|\s+dưới|\s+duoi|\s+từ|\s+tu|\.|$)/i,
    /(?:gần|gan)\s+(.+?)(?:\s+trong\s+vòng|\s+trong\s+vong|\s+trong\s+bán\s+kính|\s+trong\s+ban\s+kinh|\s+với|\s+voi|\s+có|\s+co|\s+giá|\s+gia|\s+dưới|\s+duoi|\s+từ|\s+tu|\.|$)/i,
    /quanh\s+(.+?)(?:\s+trong\s+vòng|\s+trong\s+vong|\s+trong\s+bán\s+kính|\s+trong\s+ban\s+kinh|\s+với|\s+voi|\s+có|\s+co|\s+giá|\s+gia|\s+dưới|\s+duoi|\s+từ|\s+tu|\.|$)/i,
    /(?:khu\s+vực|khu\s+vuc)\s+(.+?)(?:\s+trong\s+vòng|\s+trong\s+vong|\s+trong\s+bán\s+kính|\s+trong\s+ban\s+kinh|\s+với|\s+voi|\s+có|\s+co|\s+giá|\s+gia|\s+dưới|\s+duoi|\s+từ|\s+tu|\.|$)/i,
    /(?:tại|tai)\s+(.+?)(?:\s+trong\s+vòng|\s+trong\s+vong|\s+trong\s+bán\s+kính|\s+trong\s+ban\s+kinh|\s+với|\s+voi|\s+có|\s+co|\s+giá|\s+gia|\s+dưới|\s+duoi|\s+từ|\s+tu|\.|$)/i,
    /(?:địa\s+chỉ|dia\s+chi|địa\s+điểm|dia\s+diem|vị\s+trí|vi\s+tri)\s+(.+?)(?:\s+với|\s+voi|\s+có|\s+co|\s+giá|\s+gia|\s+dưới|\s+duoi|\s+từ|\s+tu|\.|$)/i
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      let addr = match[1].trim();
      const noiseWords = ["giá rẻ", "phòng trọ", "căn hộ", "giá tốt", "gần đây", "gia re", "phong tro", "can ho", "gia tot", "gan day"];
      for (const word of noiseWords) {
        addr = addr.replace(new RegExp(word, 'gi'), "").trim();
      }
      if (addr) return addr;
    }
  }
  return null;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  const r = 6371; // Earth radius in km
  return c * r;
}

function analyzeQuery(query) {
  const queryLower = query.toLowerCase();
  const queryLowerNorm = removeVietnameseAccents(queryLower);
  const filters = {};
  let textForVectorSearch = query;

  // 1. Kiểm tra truy vấn quy trình
  for (const [category, keywords] of Object.entries(processKeywords)) {
    for (const keyword of keywords) {
      const keywordNorm = removeVietnameseAccents(keyword);
      if (queryLower.includes(keyword) || queryLowerNorm.includes(keywordNorm)) {
        filters.process_category = category;
        textForVectorSearch = textForVectorSearch.replace(new RegExp(keyword, 'gi'), '');
        break;
      }
    }
    if (filters.process_category) break;
  }

  // 2. Lọc thông tin phòng trọ
  if (!filters.process_category) {
    const radius = extractRadiusFromQuery(query);
    filters.radius = radius;

    // Trích xuất quận
    let district = null;
    const districtMatch = queryLower.match(/quận\s+(\d+)/i) || queryLower.match(/quan\s+(\d+)/i);
    if (districtMatch) {
      district = `quận ${districtMatch[1]}`;
    } else {
      const qMatch = queryLower.match(/q\.?\s*(\d+)/i);
      if (qMatch) {
        district = `quận ${qMatch[1]}`;
      } else {
        for (const d of knownDistricts) {
          const dNorm = removeVietnameseAccents(d);
          if (queryLower.includes(d) || queryLowerNorm.includes(dNorm)) {
            district = cleanLocation(d);
            break;
          }
        }
      }
    }

    // Trích xuất thành phố
    let city = null;
    for (const c of cityPatterns) {
      const cNorm = removeVietnameseAccents(c);
      if (queryLower.includes(c) || queryLowerNorm.includes(cNorm)) {
        city = cleanLocation(c);
        break;
      }
    }

    if (district) {
      filters.district = district;
      textForVectorSearch = textForVectorSearch.replace(new RegExp(district, 'gi'), '');
    }
    if (city) {
      filters.city = city;
      textForVectorSearch = textForVectorSearch.replace(new RegExp(city, 'gi'), '');
    }

    // Trích xuất địa chỉ tìm kiếm gần/quanh
    const userAddress = extractAddressFromQuery(query);
    if (userAddress) {
      filters.userAddress = userAddress;
      textForVectorSearch = textForVectorSearch.replace(new RegExp(userAddress, 'gi'), '');
    }

    // Trích xuất giá (triệu đồng)
    const pricePatterns = [
      { pattern: /(?:từ|tu)\s+(\d+(?:\.\d+)?)\s*(?:đến|den)\s+(\d+(?:\.\d+)?)\s*(?:triệu|tr|trieu)/i, op: 'between' },
      { pattern: /(?:dưới|duoi)\s+(\d+(?:\.\d+)?)\s*(?:triệu|tr|trieu)/i, op: 'lt' },
      { pattern: /(?:đến|den)\s+(\d+(?:\.\d+)?)\s*(?:triệu|tr|trieu)/i, op: 'lte' },
      { pattern: /(?:trên|tren)\s+(\d+(?:\.\d+)?)\s*(?:triệu|tr|trieu)/i, op: 'gt' },
      { pattern: /(?:từ|tu)\s+(\d+(?:\.\d+)?)\s*(?:triệu|tr|trieu)/i, op: 'gte' }
    ];

    for (const p of pricePatterns) {
      const match = query.match(p.pattern);
      if (match) {
        if (p.op === 'between') {
          filters.price_min = parseFloat(match[1]) * 1000000;
          filters.price_max = parseFloat(match[2]) * 1000000;
        } else {
          const val = parseFloat(match[1]) * 1000000;
          if (p.op === 'lt' || p.op === 'lte') {
            filters.price_max = val;
          } else {
            filters.price_min = val;
          }
        }
        textForVectorSearch = textForVectorSearch.replace(p.pattern, '');
        break;
      }
    }

    // Trích xuất loại phòng/nhà
    for (const [houseType, synonymList] of Object.entries(synonyms)) {
      let found = false;
      for (const syn of synonymList) {
        const synNorm = removeVietnameseAccents(syn);
        if (queryLower.includes(syn) || queryLowerNorm.includes(synNorm)) {
          for (const valid of validHouseTypes) {
            if (synonymList.includes(valid)) {
              filters.type = valid;
              textForVectorSearch = textForVectorSearch.replace(new RegExp(syn, 'gi'), '');
              found = true;
              break;
            }
          }
          break;
        }
      }
      if (found) break;
    }

    // Trích xuất tiện ích
    const amenities = [];
    for (const [amenity, synonymsList] of Object.entries(amenitiesSynonyms)) {
      for (const syn of synonymsList) {
        const synNorm = removeVietnameseAccents(syn);
        if (queryLower.includes(syn) || queryLowerNorm.includes(synNorm)) {
          amenities.push(amenity);
          textForVectorSearch = textForVectorSearch.replace(new RegExp(syn, 'gi'), '');
          break;
        }
      }
    }
    if (amenities.length > 0) {
      filters.amenities = amenities;
    }
  }

  return {
    vector_query: textForVectorSearch.replace(/\s+/g, ' ').trim(),
    filters
  };
}

async function fetchOSM(address, city) {
  try {
    const fullAddress = city ? `${address}, ${city}, Việt Nam` : `${address}, Việt Nam`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`;
    console.log(`[Geocoding] Querying OSM: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "HomeNestAssistant/1.0 (longd.gemini@homenest.com)"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          address: data[0].display_name
        };
      }
    }
  } catch (err) {
    console.error(`[Geocoding] OSM Fetch error for "${address}":`, err.message);
  }
  return null;
}

async function geocodeAddress(address, city) {
  let cleanAddr = address.trim();
  // 1. Thử tìm kiếm với địa chỉ gốc
  let result = await fetchOSM(cleanAddr, city);
  if (result) return result;

  // 2. Nếu thất bại và có số nhà ở đầu, loại bỏ số nhà và tìm kiếm theo tên đường/vị trí chính
  const numberMatch = cleanAddr.match(/^\d+\s*(?:[\/\-]\s*\d+)?\s*(?:ngõ|ngo|ngách|ngach|hẻm|hem)?\s*(.+)/i);
  if (numberMatch && numberMatch[1]) {
    const strippedAddr = numberMatch[1].trim();
    console.log(`[Geocoding] Direct search failed. Retrying with stripped address: "${strippedAddr}"`);
    result = await fetchOSM(strippedAddr, city);
    if (result) return result;
  }
  return null;
}

// ----------------- Route handler -----------------
router.post("/query", async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`[ChatBot] Received query: "${query}"`);

    // Kiểm tra câu hỏi xã giao / chào hỏi xã giao
    const greetings = ["xin chào", "chào bạn", "chào", "hello", "hi", "alo", "helo", "chao"];
    const queryClean = removeVietnameseAccents(query).trim();
    const hasSearchKeywords = /phong|tro|nha|can ho|thue|tim|duoi|trieu|gan|quanh|tai|khu vuc|gia/i.test(queryClean);
    // Check if it matches any process keyword before classifying as greeting
    const queryLowerForGreeting = query.toLowerCase();
    const queryNormForGreeting = removeVietnameseAccents(queryLowerForGreeting);
    const isProcessQuery = Object.values(processKeywords).some(keywords =>
      keywords.some(kw => queryLowerForGreeting.includes(kw) || queryNormForGreeting.includes(removeVietnameseAccents(kw)))
    );
    const isGreeting = !isProcessQuery && (greetings.some(g => queryClean === removeVietnameseAccents(g)) || (!hasSearchKeywords && queryClean.length < 10));

    if (isGreeting) {
      console.log("[ChatBot] Intercepted social greeting query.");
      return res.status(200).json({
        query,
        response: `Chào bạn! Mình là Trợ lý ảo của HomeNest. 🧸\n\nMình có thể hỗ trợ bạn:\n1. Tìm kiếm phòng trọ phù hợp (ví dụ: "Tìm phòng trọ gần Triều Khúc dưới 4 triệu" hoặc "Tìm căn hộ mini có máy giặt ở quận 10").\n2. Giải đáp các quy trình đặt phòng, đăng bài, thanh toán hợp đồng và chính sách hoàn tiền trên HomeNest.\n\nBạn cần mình giúp gì hôm nay ạ?`
      });
    }

    const analysis = analyzeQuery(query);
    const filters = analysis.filters;

    let contextDocuments = [];

    if (filters.process_category) {
      // 1. TRUY VẤN QUY TRÌNH HƯỚNG DẪN
      console.log(`[ChatBot] Matched process category: "${filters.process_category}"`);
      const docPath = path.join(__dirname, "../../ChatBot/process_infor_document.json");
      
      let processDocs = [];
      try {
        const raw = await fs.readFile(docPath, "utf-8");
        processDocs = JSON.parse(raw);
      } catch (err) {
        console.error("[ChatBot] Failed to read process_infor_document.json:", err);
      }

      const matchedDoc = processDocs.find(
        (doc) => doc.category.toLowerCase() === filters.process_category.toLowerCase()
      );

      if (matchedDoc) {
        contextDocuments.push({
          type: "process_info",
          category: matchedDoc.category,
          content: matchedDoc.content
        });
      }
    } else {
      // 2. TRUY VẤN TÌM PHÒNG TRỌ
      console.log("[ChatBot] Analyzing room criteria filters:", filters);

      // Nếu có tìm địa chỉ cụ thể, tiến hành geocoding
      let userLocation = null;
      if (filters.userAddress) {
        userLocation = await geocodeAddress(filters.userAddress, filters.city);
        if (userLocation) {
          console.log(`[ChatBot] Geocoded location: lat=${userLocation.latitude}, lon=${userLocation.longitude}`);
        }
      }

      // Lấy toàn bộ phòng có trạng thái 'available' từ database
      const dbRooms = await db.Room.findAll({
        where: { status: "available" }
      });

      const filteredRooms = [];
      for (const room of dbRooms) {
        let valid = true;
        let distance = null;

        // Lọc theo khoảng cách địa lý (Haversine) nếu có toạ độ geocoding
        if (userLocation && room.latitude && room.longitude) {
          distance = haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            room.latitude,
            room.longitude
          );
          if (distance > filters.radius) {
            valid = false;
          }
        }

        // Lọc song song theo text match nếu geocoding không thành công hoặc địa chỉ bị lỗi
        if (filters.userAddress) {
          const roomAddrNorm = removeVietnameseAccents(room.address || "").replace(/\s+/g, '');
          const roomDescNorm = removeVietnameseAccents(room.description || "").replace(/\s+/g, '');
          const roomNameNorm = removeVietnameseAccents(room.room_name || "").replace(/\s+/g, '');
          
          // Lấy cụm chữ không chứa số ở đầu (ví dụ: "54 triều khúc" -> "triềukhúc")
          const addressTextOnly = removeVietnameseAccents(filters.userAddress)
            .replace(/^\d+\s*(?:[\/\-]\s*\d+)?\s*(?:ngõ|ngo|ngách|ngach|hẻm|hem)?\s*/i, "")
            .replace(/\s+/g, '');

          const matchesText = roomAddrNorm.includes(addressTextOnly) || 
                              roomDescNorm.includes(addressTextOnly) || 
                              roomNameNorm.includes(addressTextOnly);

          // Nếu geocoding thất bại (không có toạ độ địa lý) thì ta lọc dựa trên khớp tên đường
          if (!userLocation && !matchesText) {
            valid = false;
          }
        }

        // Lọc theo khoảng giá tối thiểu
        if (filters.price_min && room.price_per_month) {
          if (room.price_per_month * 1000000 < filters.price_min) {
            valid = false;
          }
        }

        // Lọc theo khoảng giá tối đa
        if (filters.price_max && room.price_per_month) {
          if (room.price_per_month * 1000000 > filters.price_max) {
            valid = false;
          }
        }

        // Lọc theo quận/huyện
        if (filters.district && room.address) {
          const filterDistrictNorm = normalizeLocation(filters.district);
          const filterQuanMatch = filterDistrictNorm.match(/quan(\d+)/);
          const filterQuanNumber = filterQuanMatch ? filterQuanMatch[1] : null;

          const addressLower = room.address.toLowerCase();
          const descriptionLower = (room.description || "").toLowerCase();
          let foundDistrict = false;

          if (filterQuanNumber) {
            if (containsDistrictNumber(room.address, filterQuanNumber) || containsDistrictNumber(room.description, filterQuanNumber)) {
              foundDistrict = true;
            }
          } else {
            const docDistrictNorm = normalizeLocation(room.address);
            if (docDistrictNorm.includes(filterDistrictNorm)) {
              foundDistrict = true;
            }
          }

          if (!foundDistrict) {
            valid = false;
          }
        }

        // Lọc theo thành phố
        if (filters.city && room.address) {
          const filterCityNorm = normalizeLocation(filters.city);
          const addressLowerNorm = normalizeLocation(room.address);
          if (!addressLowerNorm.includes(filterCityNorm)) {
            valid = false;
          }
        }

        // Lọc theo loại phòng/nhà
        if (filters.type && room.type) {
          const filterType = filters.type.toLowerCase();
          const docType = room.type.toLowerCase();
          let matchedType = false;

          for (const [key, synonymsList] of Object.entries(synonyms)) {
            if (synonymsList.includes(filterType) && synonymsList.includes(docType)) {
              matchedType = true;
              break;
            }
          }

          if (!matchedType && filterType !== docType) {
            valid = false;
          }
        }

        // Lọc theo các tiện ích
        if (filters.amenities) {
          for (const amenity of filters.amenities) {
            let matchedAmenity = false;
            const docContent = `${room.room_name} ${room.description} ${room.address}`.toLowerCase();
            const syns = amenitiesSynonyms[amenity];

            for (const syn of syns) {
              if (docContent.includes(syn)) {
                matchedAmenity = true;
                break;
              }
            }

            if (!matchedAmenity) {
              valid = false;
            }
          }
        }

        if (valid) {
          filteredRooms.push({ room, distance });
        }
      }

      // Sắp xếp
      if (userLocation) {
        filteredRooms.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        // Mặc định sắp xếp theo giá tăng dần
        filteredRooms.sort((a, b) => (a.room.price_per_month || Infinity) - (b.room.price_per_month || Infinity));
      }

      // Lấy tối đa 3 kết quả
      const topRooms = filteredRooms.slice(0, 3);
      contextDocuments = topRooms.map((r, i) => {
        const roomData = r.room.toJSON ? r.room.toJSON() : r.room;
        return {
          type: "room_info",
          room_name: roomData.room_name,
          address: roomData.address,
          price_per_month: roomData.price_per_month,
          description: roomData.description,
          distance: r.distance,
          url: `http://localhost:3000/user/room-details/${roomData.id}`
        };
      });
    }

    // 3. XÂY DỰNG PROMPT & GỌI OPENROUTER LLM
    let contextStr = "";
    contextDocuments.forEach((doc, i) => {
      if (doc.type === "process_info") {
        contextStr += `--- Hướng dẫn về ${doc.category} ---\n${doc.content}\n\n`;
      } else {
        contextStr += `--- Thông tin phòng ${i + 1} ---\n`;
        contextStr += `Tên: ${doc.room_name || "Không có tên"}\n`;
        contextStr += `Địa chỉ: ${doc.address || "Không có địa chỉ"}\n`;
        contextStr += `Giá: ${doc.price_per_month ? doc.price_per_month + " triệu/tháng" : "Chưa cập nhật"}\n`;
        if (doc.distance !== null && doc.distance !== undefined) {
          contextStr += `Khoảng cách: ${doc.distance.toFixed(2)}km\n`;
        }
        contextStr += `Mô tả: ${doc.description ? doc.description.substring(0, 100) + "..." : "Không có mô tả"}\n`;
        contextStr += `Link: ${doc.url}\n\n`;
      }
    });

    let systemPrompt = "";
    let userPrompt = "";

    if (filters.process_category) {
      systemPrompt = `Bạn là trợ lý ảo cho website HomeNest đăng tin cho thuê phòng trọ và căn hộ.
Hãy trả lời ngắn gọn, tạo phản hồi có cấu trúc rõ ràng, tập trung vào các thông tin quan trọng nhất.
Nếu không có thông tin chi tiết đầy đủ trong ngữ cảnh, hãy nêu những gì bạn biết dựa trên ngữ cảnh đó và khuyên người dùng liên hệ quản trị viên website hoặc hotline để được hỗ trợ thêm.
Trả lời rõ ràng, dễ hiểu, thân thiện, sử dụng thêm các emoji đáng yêu.`;
      
      userPrompt = `Ngữ cảnh hỗ trợ:
${contextStr}

Câu hỏi người dùng: ${query}

Hãy giải thích quy trình một cách rõ ràng và dễ hiểu.`;
    } else {
      systemPrompt = `Bạn là trợ lý ảo cho website HomeNest đăng tin cho thuê phòng trọ và căn hộ.
Nhiệm vụ của bạn là hỗ trợ người dùng tìm được phòng phù hợp nhất dựa trên thông tin danh sách các phòng được đề xuất trong ngữ cảnh.
Nếu có kết quả, hãy tóm tắt ngắn gọn các lựa chọn phòng phù hợp nhất, so sánh ưu điểm nổi bật (như giá cả, khoảng cách, tiện nghi) và đưa ra lời khuyên lựa chọn.
Bắt buộc phải kèm theo link chi tiết của từng phòng ở cuối phản hồi (ví dụ: http://localhost:3000/user/room-details/:id) để người dùng bấm vào xem.
Nếu không có phòng phù hợp, hãy thông báo thân thiện và đề xuất người dùng thay đổi tiêu chí tìm kiếm hoặc từ khóa (ví dụ: mở rộng khoảng cách hoặc giá tiền).
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, đáng yêu (có các emoji dễ thương).`;

      userPrompt = `Danh sách phòng đề xuất:
${contextStr}

Yêu cầu tìm kiếm của người dùng: ${query}

Hãy tóm tắt các lựa chọn và đưa ra lời khuyên chọn phòng phù hợp nhất.`;
    }

    const openRouterApiKey = process.env.OPENROUTER_KEY;
    if (!openRouterApiKey) {
      console.warn("WARNING: OPENROUTER_KEY is not defined in environment variables.");
    }

    console.log("[ChatBot] Sending request to OpenRouter LLM...");

    let botResponse = "";
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://homenest.com",
          "X-Title": "HomeNest Assistant"
        },
        body: JSON.stringify({
          model: "google/gemma-3-12b-it:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API failed with status ${response.status}: ${errorText}`);
      }

      const resJson = await response.json();
      botResponse = resJson.choices[0].message.content;
      console.log(`[ChatBot] Bot response completed successfully via LLM.`);
    } catch (llmError) {
      console.warn("[ChatBot] OpenRouter LLM failed or unauthorized. Generating fallback response locally...", llmError.message);
      
      // Fallback response generation
      if (filters.process_category && contextDocuments.length > 0) {
        botResponse = `Chào bạn! Dưới đây là thông tin hướng dẫn chi tiết về **${filters.process_category}** tại HomeNest:\n\n${contextDocuments[0].content}\n\n*Nếu bạn cần thêm sự hỗ trợ, hãy liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng mình nhé! 🧸*`;
      } else if (!filters.process_category) {
        if (contextDocuments.length > 0) {
          botResponse = `Chào bạn! Dưới đây là danh sách một số phòng trọ phù hợp nhất với yêu cầu tìm kiếm của bạn trên hệ thống HomeNest:\n\n`;
          contextDocuments.forEach((doc, idx) => {
            botResponse += `**Phòng ${idx + 1}: ${doc.room_name}**\n`;
            botResponse += `- Địa chỉ: ${doc.address}\n`;
            botResponse += `- Giá thuê: ${doc.price_per_month ? doc.price_per_month + " triệu/tháng" : "Chưa cập nhật"}\n`;
            if (doc.distance !== null && doc.distance !== undefined) {
              botResponse += `- Khoảng cách: ${doc.distance.toFixed(2)} km\n`;
            }
            botResponse += `- Xem chi tiết phòng: ${doc.url}\n\n`;
          });
          botResponse += `*Lời khuyên từ HomeNest: Bạn nên nhắn tin trực tiếp với chủ trọ hoặc đăng ký đặt phòng ngay để giữ chỗ sớm nhất nhé! 🧸*`;
        } else {
          botResponse = `Chào bạn! Rất tiếc là hiện tại hệ thống HomeNest chưa tìm thấy phòng nào phù hợp hoàn toàn với tiêu chí tìm kiếm của bạn. 😥\n\nBạn có thể thử điều chỉnh lại câu hỏi của mình, ví dụ như:\n- Thay đổi khoảng giá (ví dụ: "dưới 5 triệu", "từ 2 đến 4 triệu")\n- Thay đổi địa điểm hoặc quận khác (ví dụ: "ở quận 10", "gần Đại học Bách Khoa")\n- Tìm kiếm theo các tiện ích khác.\n\nChúc bạn sớm tìm được căn phòng ưng ý! 🧸`;
        }
      } else {
        botResponse = `Chào bạn! HomeNest chưa tìm thấy thông tin phù hợp với yêu cầu hướng dẫn này. Bạn vui lòng liên hệ quản trị viên website để được hỗ trợ nhé! 🧸`;
      }
    }

    return res.status(200).json({
      query,
      response: botResponse
    });

  } catch (error) {
    console.error("[ChatBot] Handler error:", error);
    next(error);
  }
});

module.exports = router;
