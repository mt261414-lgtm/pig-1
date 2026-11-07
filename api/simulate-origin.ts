export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { baseFood = 'beef', origin = 'imported_air', farming = 'feedlot', packaging = 'plastic' } = req.body || {};

    let baseKg = baseFood === 'beef' ? 14.5 : baseFood === 'tofu' ? 0.6 : baseFood === 'chicken' ? 2.8 : 4.5;

    // Origin transport factor
    let transportFactor = 1.0;
    let transportDesc = '국내 일반 육상 운송 (트럭 150km)';
    if (origin === 'local_direct') {
      transportFactor = 0.85;
      transportDesc = '반경 50km 이내 로컬 푸드 직매장 (운송 탄소 70% 절감)';
    } else if (origin === 'imported_ship') {
      transportFactor = 1.15;
      transportDesc = '해외 선박 냉동 운송 (대량 수송으로 항공 대비 효율적)';
    } else if (origin === 'imported_air') {
      transportFactor = 1.65;
      transportDesc = '해외 신선 항공 특송 (초고탄소 운송, 탄소 65% 급증)';
    }

    // Farming method factor
    let farmingFactor = 1.0;
    let farmingDesc = '일반 관행 집약 농축산';
    if (farming === 'organic_regenerative') {
      farmingFactor = 0.75;
      farmingDesc = '재생 유기농업 / 자연 방목 (토양 탄소 격리 보너스)';
    } else if (farming === 'heated_greenhouse') {
      farmingFactor = 1.45;
      farmingDesc = '화석연료 난방 시설 온실 재배 (동절기 에너지 소비 극대화)';
    } else if (farming === 'smart_renewable') {
      farmingFactor = 0.8;
      farmingDesc = '신재생에너지 스마트팜 (수자원 90% 절약, LED 고효율)';
    }

    // Packaging factor
    let packFactor = 1.0;
    let packDesc = '일반 플라스틱 진공 포장';
    if (packaging === 'zero_waste') {
      packFactor = 0.92;
      packDesc = '다회용기 용기내 챌린지 / 생분해 포장재';
    } else if (packaging === 'multi_plastic_ice') {
      packFactor = 1.12;
      packDesc = '새벽배송 3중 보랭 스티로폼 + 아이스팩 포장';
    }

    const finalCarbonKg = Number((baseKg * transportFactor * farmingFactor * packFactor).toFixed(2));
    const baselineStandardKg = baseKg;
    const differencePercent = Number((((finalCarbonKg - baselineStandardKg) / baselineStandardKg) * 100).toFixed(1));

    return res.json({
      success: true,
      data: {
        baseFood,
        finalCarbonKg,
        baselineStandardKg,
        differencePercent,
        factors: {
          transport: { factor: transportFactor, desc: transportDesc },
          farming: { factor: farmingFactor, desc: farmingDesc },
          packaging: { factor: packFactor, desc: packDesc },
        },
        educationalTakeaway: `동일한 ${baseFood === 'beef' ? '소고기' : baseFood === 'tofu' ? '두부' : '식사'}라도 유통 및 생산 방식에 따라 탄소 배출량이 기준치 대비 ${differencePercent > 0 ? '+' + differencePercent : differencePercent}% 차이가 납니다.`,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
