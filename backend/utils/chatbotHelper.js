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

module.exports = {
  knownDistricts,
  cityPatterns,
  validHouseTypes,
  synonyms,
  amenitiesSynonyms,
  processKeywords,
  removeVietnameseAccents,
  normalizeLocation,
  containsDistrictNumber,
  cleanLocation,
  extractRadiusFromQuery,
  extractAddressFromQuery,
  haversineDistance,
  analyzeQuery,
  fetchOSM,
  geocodeAddress
};
