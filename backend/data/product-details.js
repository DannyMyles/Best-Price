// Descriptions + specs for the imported catalogue, keyed by SKU.
// Applied by `npm run enrich-products`. Only well-established, model-level facts are listed —
// where a model's exact numbers weren't certain, the entry sticks to what the product *is*.
// Specs format: "Label: value | Label: value".
const P = {};
const d = (sku, description, specs) => {
  P[sku] = { description, specs: specs.split("|").map((s) => s.trim()).filter(Boolean).map((s) => {
    const i = s.indexOf(":");
    return { label: s.slice(0, i).trim(), value: s.slice(i + 1).trim() };
  }) };
};

// ---------------------------------------------------------------- Canon cameras
d("CAN-2000D-DC-18-55", "An easy first DSLR: 24.1MP APS-C sensor, built-in Wi-Fi and a bright optical viewfinder, sold with the EF-S 18-55mm kit lens. A great step up from a phone for portraits, family and travel photos.",
  "Type: DSLR|Sensor: 24.1MP APS-C CMOS|Lens mount: Canon EF / EF-S|Video: Full HD 1080p|Screen: 3.0\" LCD|Connectivity: Wi-Fi, NFC|Kit lens: EF-S 18-55mm");
d("CAN-R100-18-55-TRAVEL-KIT", "Canon's lightest, most affordable mirrorless: 24.1MP APS-C, fast Dual Pixel autofocus and 4K video in a small body that slips into a travel bag, with a versatile kit zoom.",
  "Type: Mirrorless|Sensor: 24.1MP APS-C CMOS|Lens mount: Canon RF|Autofocus: Dual Pixel CMOS AF|Video: 4K|Viewfinder: Electronic (EVF)|Kit lens: RF-S 18-55mm");
d("CAN-R100-DUAL-LENSES", "The R100 with two lenses — a standard zoom for everyday shots and the RF-S 55-210mm telephoto for sport, wildlife and portraits — so you're covered from wide to far.",
  "Type: Mirrorless|Sensor: 24.1MP APS-C CMOS|Lens mount: Canon RF|Video: 4K|Lenses: RF-S 18-45mm + RF-S 55-210mm|Autofocus: Dual Pixel CMOS AF");
d("CAN-R50V-KIT-14-30M", "Canon's vlogging-focused R50 V with the compact RF-S 14-30mm power-zoom lens — built for creators who shoot video first, with a wide view for talking to camera.",
  "Type: Mirrorless (video-focused)|Sensor: 24.2MP APS-C|Lens mount: Canon RF-S / RF|Kit lens: RF-S 14-30mm power zoom|Best for: Vlogging and short-form video");
d("CAN-R50V-BODY", "The Canon EOS R50 V body only — a video-first APS-C mirrorless for vloggers and content creators who already have RF or RF-S lenses.",
  "Type: Mirrorless (video-focused)|Sensor: 24.2MP APS-C|Lens mount: Canon RF-S / RF|Package: Body only|Best for: Vlogging and short-form video");
d("CAN-R50-KIT-18-45", "A pocketable 24.2MP mirrorless with subject-tracking autofocus, 4K video and a flip-out screen. The RF-S 18-45mm kit lens makes it ready to shoot straight from the box.",
  "Type: Mirrorless|Sensor: 24.2MP APS-C CMOS|Lens mount: Canon RF|Video: 4K 30p|Autofocus: Dual Pixel CMOS AF II with subject detection|Screen: 3.0\" vari-angle touchscreen|Kit lens: RF-S 18-45mm f/4.5-6.3 IS STM");
d("CAN-R50-DUAL-LENS", "The EOS R50 with two lenses: the RF-S 18-45mm for everyday and the RF-S 55-210mm for zoomed-in shots — an all-in-one kit for family, travel and events.",
  "Type: Mirrorless|Sensor: 24.2MP APS-C CMOS|Video: 4K 30p|Screen: 3.0\" vari-angle touchscreen|Lenses: RF-S 18-45mm f/4.5-6.3 + RF-S 55-210mm f/5-7.1 IS STM");
d("CAN-R50-CONT-CREATOR", "The EOS R50 packaged for content creators — camera, kit lens and creator accessories for vlogs, reels and YouTube. Ask us on WhatsApp for the exact contents of the current kit.",
  "Type: Mirrorless|Sensor: 24.2MP APS-C CMOS|Video: 4K 30p|Screen: 3.0\" vari-angle touchscreen|Kit lens: RF-S 18-45mm|Best for: Vlogging and social content");
d("CAN-R5-M2-KIT-24-105L", "Canon's flagship hybrid: 45MP full-frame stacked sensor, 8K video, blazing 30fps electronic burst and in-body stabilisation, with the professional RF 24-105mm f/4L lens.",
  "Type: Full-frame mirrorless|Sensor: 45MP full-frame stacked BSI CMOS|Video: 8K RAW|Burst: Up to 30fps electronic|Stabilisation: In-body (IBIS)|Kit lens: RF 24-105mm f/4L IS USM");
d("CAN-R8-BODY", "The lightest full-frame EOS R: 24.2MP sensor, fast subject-detection autofocus and 4K video at an accessible price. Body only.",
  "Type: Full-frame mirrorless|Sensor: 24.2MP full-frame CMOS|Lens mount: Canon RF|Video: 4K up to 60p|Weight: Around 460g (body)|Package: Body only");
d("CAN-R8-KIT-24-50MM", "The compact full-frame EOS R8 with the small, light RF 24-50mm zoom — an easy full-frame kit for travel, portraits and video.",
  "Type: Full-frame mirrorless|Sensor: 24.2MP full-frame CMOS|Video: 4K up to 60p|Kit lens: RF 24-50mm f/4.5-6.3 IS STM");
d("CAN-R8-KIT-24-105MM", "The EOS R8 full-frame body with the RF 24-105mm zoom — a longer-reaching all-rounder for travel, events and video.",
  "Type: Full-frame mirrorless|Sensor: 24.2MP full-frame CMOS|Video: 4K up to 60p|Kit lens: RF 24-105mm f/4-7.1 IS STM");
d("CAN-R7-KIT-18-150MM", "A fast APS-C mirrorless for action and wildlife: 32.5MP, in-body stabilisation and 30fps electronic burst, with a walk-around RF-S 18-150mm zoom.",
  "Type: APS-C mirrorless|Sensor: 32.5MP APS-C CMOS|Stabilisation: In-body (IBIS)|Burst: Up to 30fps electronic|Video: 4K 60p|Card slots: Dual SD|Kit lens: RF-S 18-150mm f/3.5-6.3 IS STM");
d("CAN-R7-BODY", "The EOS R7 body only: 32.5MP APS-C, in-body stabilisation, dual card slots and 30fps burst — a serious tool for sport and wildlife.",
  "Type: APS-C mirrorless|Sensor: 32.5MP APS-C CMOS|Stabilisation: In-body (IBIS)|Burst: Up to 30fps electronic|Video: 4K 60p|Card slots: Dual SD|Package: Body only");
d("CAN-RP-RF-24-105", "The most affordable way into full-frame: EOS RP with an RF 24-105mm zoom. Light, easy to carry, and great for portraits and travel.",
  "Type: Full-frame mirrorless|Sensor: 26.2MP full-frame CMOS|Lens mount: Canon RF|Weight: Around 485g (body)|Kit lens: RF 24-105mm");
d("CAN-5D-KIT-24-105-USM", "A workhorse professional DSLR: 30.4MP full-frame, rugged weather-sealed body and the EF 24-105mm f/4L lens. Trusted by wedding and event photographers.",
  "Type: Full-frame DSLR|Sensor: 30.4MP full-frame CMOS|Autofocus: 61-point AF|Burst: 7fps|Video: 4K|Screen: 3.2\" touchscreen|Kit lens: EF 24-105mm f/4L IS USM");
d("CAN-5D-BODY", "EOS 5D Mark IV body only — 30.4MP full-frame DSLR with 61-point autofocus, weather sealing and Wi-Fi, ideal if you already own EF lenses.",
  "Type: Full-frame DSLR|Sensor: 30.4MP full-frame CMOS|Autofocus: 61-point AF|Burst: 7fps|Video: 4K|Package: Body only");
d("CAN-R6-BODY", "Full-frame speed and low-light strength: EOS R6 with 20.1MP sensor, in-body stabilisation, 12/20fps burst and 4K 60p. Body only.",
  "Type: Full-frame mirrorless|Sensor: 20.1MP full-frame CMOS|Stabilisation: In-body (IBIS)|Burst: 12fps mechanical / 20fps electronic|Video: 4K 60p|Package: Body only");
d("CAN-R6-24-105-STM", "EOS R6 full-frame mirrorless with the RF 24-105mm STM zoom — a complete kit for photo and video with excellent low-light performance.",
  "Type: Full-frame mirrorless|Sensor: 20.1MP full-frame CMOS|Stabilisation: In-body (IBIS)|Video: 4K 60p|Kit lens: RF 24-105mm IS STM");
d("CAN-R6-BODY-MARK3", "The newest EOS R6 generation body — a full-frame hybrid built for both stills and video creators. Body only; ask us on WhatsApp for the latest specification sheet.",
  "Type: Full-frame mirrorless|Lens mount: Canon RF|Package: Body only|Generation: Mark III");
d("CAN-XA60B", "A professional 4K camcorder for weddings, events and interviews, with 20x optical zoom and a handle unit with XLR audio inputs.",
  "Type: Professional camcorder|Video: 4K UHD|Zoom: 20x optical|Audio: XLR inputs via handle unit");
d("CAN-C50-BODY-VIDEO", "Canon's compact Cinema EOS full-frame camera for filmmakers and productions — a serious video body with RF lens mount. Body only.",
  "Type: Cinema camera|Format: Full-frame|Lens mount: Canon RF|Package: Body only");

// ---------------------------------------------------------------- DJI / Insta360 cameras
d("DJI-DJI-OSMO-ACTION-6", "DJI's rugged action camera — waterproof, stabilised and ready for biking, diving and travel. Ask us on WhatsApp for the current full specification.",
  "Type: Action camera|Brand: DJI|Best for: Sports, travel and vlogging");
d("DJI-DJI-POCKET-3-STAND", "A pocket-sized camera with a 3-axis gimbal, 1-inch sensor and 4K 120fps slow-motion, with a mini tripod stand. The easiest way to shoot smooth, cinematic video.",
  "Type: Gimbal camera|Sensor: 1-inch CMOS|Video: 4K up to 120fps|Stabilisation: 3-axis mechanical gimbal|Screen: 2\" rotating touchscreen|Includes: Mini tripod stand");
d("DJI-DIJ-POCKET-3-COMBO", "The Creator Combo: Osmo Pocket 3 plus the extras for shooting — extra handle, wide-angle lens, mini tripod, wireless mic transmitter and carrying bag.",
  "Type: Gimbal camera|Sensor: 1-inch CMOS|Video: 4K up to 120fps|Stabilisation: 3-axis mechanical gimbal|Package: Creator Combo");
d("DJI-DJI-POCKET-4-COMBO", "The newest Osmo Pocket in the Creator Combo package — DJI's pocket gimbal camera for smooth vlogs and travel video. Ask us on WhatsApp for the full specification.",
  "Type: Gimbal camera|Brand: DJI|Package: Creator Combo|Generation: Pocket 4");
d("INS-INSTA-360-X5-CAMERA", "A 360° camera that records everything around you in up to 8K, then lets you choose the shot later. Waterproof, with an invisible-selfie-stick effect and easy phone editing.",
  "Type: 360° camera|Video: Up to 8K|Waterproof: Yes (IPX8, no case)|Feature: Invisible selfie-stick effect|Best for: Travel, action and creative shots");
d("INS-INSTA-360-GO3-128-GB", "A tiny, thumb-sized action camera that clips anywhere and pairs with a charging Action Pod. Perfect for hands-free POV, vlogs and kids' sports. 128GB model.",
  "Type: Mini action camera|Size: Thumb-sized|Stabilisation: FlowState|Storage: 128GB built in|Includes: Action Pod");
d("INS-INSTA-360-GO-ULTRA-STANDARD", "The next-generation Insta360 GO — an ultra-light, pocketable action camera for hands-free POV shooting. Standard package.",
  "Type: Mini action camera|Brand: Insta360|Generation: GO Ultra|Package: Standard");
d("INS-INSTA-360-GO-ULTRA-G-COMBO", "Insta360 GO Ultra in the combo package with extra accessories for hands-free shooting. Ask us on WhatsApp for the exact box contents.",
  "Type: Mini action camera|Brand: Insta360|Generation: GO Ultra|Package: Combo");

// ---------------------------------------------------------------- Sony cameras
d("SNY-ZV-E10", "Sony's vlogging camera: 24.2MP APS-C, flip-out screen, 4K video and a great built-in directional mic with windscreen. Interchangeable E-mount lenses. Body only.",
  "Type: Mirrorless vlog camera|Sensor: 24.2MP APS-C Exmor CMOS|Lens mount: Sony E|Video: 4K 30p|Screen: 3.0\" vari-angle touchscreen|Audio: 3-capsule mic with windscreen");
d("SNY-A6400M-18-135M", "Fast-autofocus APS-C mirrorless (24.2MP, 425-point AF, 11fps) with the 18-135mm all-in-one zoom — one lens for almost everything.",
  "Type: Mirrorless|Sensor: 24.2MP APS-C CMOS|Autofocus: 425-point phase detection|Burst: 11fps|Video: 4K 30p|Kit lens: E 18-135mm f/3.5-5.6 OSS");
d("SNY-A6400-16-50MM", "The a6400 with the compact 16-50mm power-zoom lens — a small, light kit with Sony's fast real-time tracking autofocus.",
  "Type: Mirrorless|Sensor: 24.2MP APS-C CMOS|Autofocus: 425-point phase detection|Burst: 11fps|Video: 4K 30p|Kit lens: E PZ 16-50mm f/3.5-5.6 OSS");
d("SNY-A6700-18-135MM", "Sony's advanced APS-C: 26MP sensor, AI-powered subject-recognition autofocus, in-body stabilisation and 4K 120p. Includes the 18-135mm zoom.",
  "Type: Mirrorless|Sensor: 26MP APS-C Exmor R BSI|Stabilisation: In-body (5-axis)|Video: 4K up to 120p|Autofocus: AI subject recognition|Kit lens: E 18-135mm");
d("SNY-A6700-BODY", "The Sony a6700 body only — 26MP APS-C with AI autofocus, in-body stabilisation and 4K 120p video.",
  "Type: Mirrorless|Sensor: 26MP APS-C Exmor R BSI|Stabilisation: In-body (5-axis)|Video: 4K up to 120p|Package: Body only");
d("SNY-A-7M4K-28-70MM", "The a7 IV: 33MP full-frame all-rounder with excellent autofocus, 10fps and 4K 60p, with the 28-70mm kit zoom.",
  "Type: Full-frame mirrorless|Sensor: 33MP full-frame BSI CMOS|Burst: 10fps|Video: 4K 60p|Stabilisation: In-body (5.5 stops)|Kit lens: FE 28-70mm f/3.5-5.6 OSS");
d("SNY-A-7M4-BODY", "Sony a7 IV body only — a hybrid full-frame camera that's as strong at video as it is at stills.",
  "Type: Full-frame mirrorless|Sensor: 33MP full-frame BSI CMOS|Burst: 10fps|Video: 4K 60p|Stabilisation: In-body (5.5 stops)|Package: Body only");
d("SNY-HXR-N800", "A professional 4K camcorder with a 1-inch sensor, 12x optical zoom, built-in ND filters and XLR audio — made for events, corporate and broadcast work.",
  "Type: Professional camcorder|Sensor: 1.0-type CMOS|Video: 4K|Zoom: 12x optical|Audio: XLR inputs|Filters: Built-in ND");

// ---------------------------------------------------------------- Nikon
d("NIK-D7500-18-140MM", "A tough, fast DX-format DSLR: 20.9MP, 8fps burst, 4K video and a weather-sealed body, with the versatile 18-140mm VR lens.",
  "Type: DSLR|Sensor: 20.9MP DX CMOS|Burst: 8fps|Video: 4K 30p|Screen: 3.2\" tilting touchscreen|Kit lens: AF-S DX 18-140mm f/3.5-5.6G ED VR");
d("NIK-D780-BODY", "Nikon's full-frame hybrid DSLR: 24.5MP BSI sensor, dual card slots, 4K video and great mirrorless-style live view autofocus. Body only.",
  "Type: Full-frame DSLR|Sensor: 24.5MP full-frame BSI CMOS|Burst: 7fps|Video: 4K 30p|Card slots: Dual SD|Package: Body only");
d("NIK-Z30", "Nikon's compact mirrorless made for vlogging and content creators: 20.9MP DX sensor, 4K video and a flip-out screen. Body only.",
  "Type: Mirrorless|Sensor: 20.9MP DX CMOS|Lens mount: Nikon Z|Video: 4K 30p|Screen: 3.0\" vari-angle touchscreen|Package: Body only");

// ---------------------------------------------------------------- Lenses
d("CAN-10-18-MM", "A compact ultra-wide zoom for RF-mount APS-C cameras (R7, R10, R50…) — great for landscapes, interiors and vlogging.",
  "Mount: Canon RF-S|Focal length: 10-18mm|Aperture: f/4.5-6.3|Stabilisation: Optical IS|Motor: STM|Weight: About 150g");
d("CAN-16MM", "A tiny, light full-frame ultra-wide prime with a fast f/2.8 aperture — ideal for vlogging, astro, interiors and travel.",
  "Mount: Canon RF|Focal length: 16mm|Aperture: f/2.8|Motor: STM|Weight: About 165g");
d("CAN-24-105-USM", "The professional standard zoom for RF cameras — constant f/4 aperture, image stabilisation and weather sealing.",
  "Mount: Canon RF|Focal length: 24-105mm|Aperture: f/4 constant|Stabilisation: Optical IS|Series: L (professional)|Motor: USM");
d("CAN-50MM1-8-STM", "The affordable 'nifty fifty' for RF cameras: sharp, light and fast, with lovely background blur for portraits and low light.",
  "Mount: Canon RF|Focal length: 50mm|Aperture: f/1.8|Motor: STM|Weight: About 160g");
d("CAN-35MM1-8", "A versatile 35mm prime with close-up (macro) ability and image stabilisation — great for everyday, street and video.",
  "Mount: Canon RF|Focal length: 35mm|Aperture: f/1.8|Stabilisation: Optical IS|Feature: 0.5x macro|Motor: STM");
d("CAN-24-105-STM", "A lightweight, affordable all-in-one zoom for RF cameras — one lens for landscapes to portraits.",
  "Mount: Canon RF|Focal length: 24-105mm|Aperture: f/4-7.1|Stabilisation: Optical IS|Motor: STM|Weight: About 395g");
d("CAN-24-70-2-8-USM", "Canon's professional f/2.8 standard zoom for RF: exceptional sharpness, beautiful blur and pro build for weddings and events.",
  "Mount: Canon RF|Focal length: 24-70mm|Aperture: f/2.8 constant|Stabilisation: Optical IS|Series: L (professional)|Motor: USM");
d("CAN-85MM-1-8F2", "A stabilised 85mm portrait lens with macro capability — smooth background blur and sharp detail at a friendly price.",
  "Mount: Canon RF|Focal length: 85mm|Aperture: f/2|Stabilisation: Optical IS|Feature: 0.5x macro|Motor: STM");
d("CAN-70-200-F2-8-USM", "The pro's telephoto zoom for sport, weddings and events — f/2.8 all the way, stabilised and compact for its class.",
  "Mount: Canon RF|Focal length: 70-200mm|Aperture: f/2.8 constant|Stabilisation: Optical IS|Series: L (professional)|Motor: USM");
d("CAN-70-200-F4L-USM", "A lighter, more affordable L-series telephoto zoom — constant f/4 with stabilisation, easy to carry all day.",
  "Mount: Canon RF|Focal length: 70-200mm|Aperture: f/4 constant|Stabilisation: Optical IS|Series: L (professional)|Motor: USM|Weight: About 695g");
d("CAN-75-300-F4-5-6", "A budget telephoto zoom for Canon EF/EF-S DSLRs — reach far for wildlife, sport and school events.",
  "Mount: Canon EF|Focal length: 75-300mm|Aperture: f/4-5.6|Type: Telephoto zoom");
d("CAN-100-500-MM", "Serious super-telephoto reach for wildlife and aviation on RF cameras, with stabilisation and L-series optics.",
  "Mount: Canon RF|Focal length: 100-500mm|Aperture: f/4.5-7.1|Stabilisation: Optical IS|Series: L (professional)|Motor: USM");
d("CAN-10-18-STM", "A compact ultra-wide zoom for Canon EF-S DSLRs (APS-C) — dramatic landscapes, interiors and group shots.",
  "Mount: Canon EF-S|Focal length: 10-18mm|Aperture: f/4.5-5.6|Stabilisation: Optical IS|Motor: STM|Weight: About 240g");
d("CAN-50MM1-8", "The affordable EF 'nifty fifty' — sharp, light and fast for portraits and low light on Canon DSLRs.",
  "Mount: Canon EF|Focal length: 50mm|Aperture: f/1.8|Motor: STM|Weight: About 160g");
d("CAN-75-300MM", "A budget telephoto zoom for Canon EF DSLRs — reach further for wildlife, sport and events.",
  "Mount: Canon EF|Focal length: 75-300mm|Aperture: f/4-5.6|Type: Telephoto zoom");
d("SNY-LENS-24-105MM", "Sony's G-series standard zoom for full-frame E-mount: constant f/4, image stabilisation and a useful range for photo and video.",
  "Mount: Sony FE|Focal length: 24-105mm|Aperture: f/4 constant|Stabilisation: Optical SteadyShot (OSS)|Series: G");
d("SNY-LENS-50MM-1-8", "A small, affordable full-frame 50mm prime for Sony E-mount — sharp, fast and great for portraits.",
  "Mount: Sony FE|Focal length: 50mm|Aperture: f/1.8|Weight: About 186g");

// ---------------------------------------------------------------- TVs
const tv = (sku, desc, specs) => d(sku, desc, specs);
tv("SNY-43S20M2", "A 43-inch Sony BRAVIA with a sharp 4K HDR picture and Google TV for streaming apps — a smart, space-saving choice for bedrooms and small living rooms.", "Screen size: 43 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: K-43S20M2");
tv("SNY-50S20M2", "A 50-inch Sony BRAVIA with a sharp 4K HDR picture and Google TV for all your streaming apps.", "Screen size: 50 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: K-50S20M2");
tv("SNY-55-S20", "A 55-inch Sony BRAVIA 2 II with a sharp 4K HDR picture and Google TV — a great everyday living-room TV.", "Screen size: 55 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: K-55S20M2");
tv("SNY-55-S30", "Sony BRAVIA 3 in 55 inches: a brighter, more refined 4K HDR picture with Google TV and Sony's picture processing.", "Screen size: 55 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: K-55S30");
tv("SNY-65S20M2", "A 65-inch Sony BRAVIA 2 II — big-screen 4K HDR with Google TV at an approachable price.", "Screen size: 65 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: K-65S20M2");
tv("SNY-65-S30M3", "Sony BRAVIA 3 in 65 inches: brighter, more refined 4K HDR with Google TV — a big-screen upgrade for movies and sport.", "Screen size: 65 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: K-65S30M3");
tv("SNY-85-S30", "An immersive 85-inch Sony BRAVIA 3 — a true home-cinema screen with 4K HDR and Google TV.", "Screen size: 85 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: K-85S30");
tv("HIS-43A4", "A 43-inch Full HD Hisense smart TV — an affordable screen for bedrooms, kitchens and small spaces.", "Screen size: 43 inches|Resolution: Full HD 1080p|Smart TV: Yes|Series: A4");
tv("HIS-55A6K", "A 55-inch Hisense 4K TV with sharp Ultra HD picture and smart apps — great value for a family living room.", "Screen size: 55 inches|Resolution: 4K Ultra HD|Smart TV: Yes|Series: A6K");
tv("HIS-55U6K", "A 55-inch Hisense Mini-LED ULED TV — deeper blacks and brighter highlights than standard LED for movies and gaming.", "Screen size: 55 inches|Resolution: 4K Ultra HD|Panel: Mini-LED ULED|Smart TV: Yes|Series: U6K");
tv("HIS-65U6", "A 65-inch Hisense ULED TV with a bright, colourful 4K picture — big-screen quality at a competitive price.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Panel: ULED|Smart TV: Yes|Series: U6");
tv("HIS-65A6", "A 65-inch Hisense 4K TV — a big Ultra HD screen at an entry-level price.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Smart TV: Yes|Series: A6");
tv("HIS-55Q6", "A 55-inch Hisense QLED TV with rich, vivid colour thanks to quantum-dot technology.", "Screen size: 55 inches|Resolution: 4K Ultra HD|Panel: QLED (quantum dot)|Smart TV: Yes|Series: Q6");
tv("SNY-55X85L", "A 55-inch Sony X85L 4K Full Array LED with Google TV — strong contrast and smooth motion for movies and gaming.", "Screen size: 55 inches|Resolution: 4K Ultra HD|Backlight: Full Array LED|Smart TV: Google TV|Model: X85L");
tv("SNY-55X90L", "A 55-inch Sony X90L 4K Full Array LED with the Cognitive Processor XR — a step up in contrast and detail.", "Screen size: 55 inches|Resolution: 4K Ultra HD|Backlight: Full Array LED|Processor: Cognitive Processor XR|Smart TV: Google TV|Model: X90L");
tv("SNY-65X75K", "A 65-inch Sony X75K 4K LED with Google TV — a big screen with Sony's clean, natural picture.", "Screen size: 65 inches|Resolution: 4K Ultra HD|HDR: Yes|Smart TV: Google TV|Model: X75K");
tv("SNY-65X85L", "A 65-inch Sony X85L 4K Full Array LED with Google TV — big-screen contrast and smooth motion for movies and gaming.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Backlight: Full Array LED|Smart TV: Google TV|Model: X85L");
tv("SNY-65XR70-OLED", "A 65-inch premium Sony BRAVIA XR TV with Google TV and Sony's XR picture processing. Ask us on WhatsApp to confirm the exact panel type for the current model.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Range: BRAVIA XR|Smart TV: Google TV|Model: XR70");
tv("SNY-65XR80-OLED", "A 65-inch Sony BRAVIA 8 II QD-OLED TV with Google TV and Sony's XR picture processing — deep blacks, rich colour and a premium build for movies and gaming.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Panel: QD-OLED|Range: BRAVIA 8 II (XR80)|Smart TV: Google TV|Model: K-65XR80M2");
tv("SAM-32T5300", "A 32-inch Samsung Full HD smart TV — compact, affordable and perfect for bedrooms and small rooms.", "Screen size: 32 inches|Resolution: Full HD 1080p|Smart TV: Yes (Samsung Smart Hub)|Model: T5300");
tv("SAM-50CU8000", "A 50-inch Samsung Crystal UHD 4K TV with smart apps and vivid colour at a friendly price.", "Screen size: 50 inches|Resolution: 4K Ultra HD|Panel: Crystal UHD|Smart TV: Yes|Model: CU8000");
tv("SAM-50AU7000", "A 50-inch Samsung Crystal UHD 4K TV — sharp Ultra HD picture and smart apps for everyday viewing.", "Screen size: 50 inches|Resolution: 4K Ultra HD|Panel: Crystal UHD|Smart TV: Yes|Model: AU7000");
tv("SAM-65DU7010", "A 65-inch Samsung Crystal UHD 4K TV — a big Ultra HD screen with smart apps.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Panel: Crystal UHD|Smart TV: Yes|Model: DU7010");
tv("SAM-65DU8000", "A 65-inch Samsung Crystal UHD 4K TV with Crystal Processor 4K — a big, sharp screen for movies and sport.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Panel: Crystal UHD|Smart TV: Yes|Model: DU8000");
tv("SAM-75Q7F", "A huge 75-inch Samsung QLED 4K TV — rich quantum-dot colour for a home-cinema experience.", "Screen size: 75 inches|Resolution: 4K Ultra HD|Panel: QLED (quantum dot)|Smart TV: Yes|Model: Q7F");
tv("TCL-50S5K", "A 50-inch TCL 4K LED TV with Google TV — great value for streaming and everyday viewing.", "Screen size: 50 inches|Resolution: 4K Ultra HD|Smart TV: Google TV|Series: S5K");
tv("TCL-50-V6C", "A 50-inch TCL 4K TV with a sharp Ultra HD picture and smart features at a budget-friendly price.", "Screen size: 50 inches|Resolution: 4K Ultra HD|Smart TV: Yes|Series: V6C");
tv("TCL-55T6C", "A 55-inch TCL QLED 4K TV — quantum-dot colour and a bright picture without the premium price.", "Screen size: 55 inches|Resolution: 4K Ultra HD|Panel: QLED (quantum dot)|Smart TV: Yes|Series: T6C");
tv("TCL-55V6D", "A 55-inch TCL 4K TV — a sharp Ultra HD picture and smart features at an affordable price.", "Screen size: 55 inches|Resolution: 4K Ultra HD|Smart TV: Yes|Series: V6D");
tv("TCL-65V6D", "A 65-inch TCL 4K TV — a big-screen Ultra HD picture at a very competitive price.", "Screen size: 65 inches|Resolution: 4K Ultra HD|Smart TV: Yes|Series: V6D");

// ---------------------------------------------------------------- Microphones
d("DJI-DJI-MIC-3", "DJI's wireless microphone system: two transmitters and a receiver with 32-bit float internal recording, long range and a charging case — clean audio for interviews, vlogs and events.",
  "Type: Wireless mic system|Package: 2 transmitters + receiver + charging case|Recording: 32-bit float internal|Range: Up to about 400m (open area)");
d("DJI-DJI-MIC-2", "Two-transmitter wireless mic kit with a touchscreen receiver, 32-bit float internal recording and a charging case — pro sound for creators.",
  "Type: Wireless mic system|Package: 2 transmitters + receiver + charging case|Recording: 32-bit float internal|Range: Up to about 250m (open area)");
d("DJI-DJI-MIC-MINI2", "Ultra-compact wireless mic system — tiny transmitters clip on clothing for clear audio for vlogs, interviews and phone videos.",
  "Type: Wireless mic system|Package: 2 transmitters + receiver + charging case|Size: Ultra-compact clip-on transmitters|Best for: Vlogs and interviews");
d("DJI-DJI-MIC-MINI", "A tiny, lightweight wireless mic kit that clips on and sounds great — ideal for phones and cameras.",
  "Type: Wireless mic system|Package: 2 transmitters + receiver + charging case|Size: Ultra-compact clip-on transmitters|Best for: Vlogs and interviews");
d("HOL-HOLLYLAND-LARK-M2", "A featherweight wireless lavalier system for creators — clip it on, connect to your camera or phone and record clear audio.",
  "Type: Wireless lavalier mic|Frequency: 2.4GHz|Range: Up to about 300m (open area)|Best for: Interviews and vlogs");
d("HOL-HOLLYLAND-LARK-M2S", "The upgraded Lark M2 wireless lavalier system with improved audio and easier setup for creators.",
  "Type: Wireless lavalier mic|Frequency: 2.4GHz|Best for: Interviews and vlogs|Series: Lark M2S");
d("HOL-HOLLYLAND-LARK-M2S-COM", "The Lark M2S combo — a complete wireless mic kit with everything you need to shoot straight away.",
  "Type: Wireless lavalier mic|Frequency: 2.4GHz|Package: Combo kit|Series: Lark M2S");
d("ROD-RODE-WIRELESS-ME", "A compact wireless mic system from RØDE — a clip-on transmitter with built-in mic plus a receiver for cameras and phones.",
  "Type: Wireless mic system|Frequency: 2.4GHz|Range: Up to about 100m (line of sight)|Brand: RØDE");
d("ROD-RODE-WIRELESS-PRO", "RØDE's professional wireless system with 32-bit float recording and timecode — broadcast-grade audio for serious creators.",
  "Type: Wireless mic system|Recording: 32-bit float|Range: Up to about 260m (line of sight)|Brand: RØDE");
d("ROD-RODE-INTERVIEW-GO", "A handheld interview microphone adapter that turns a Wireless GO transmitter into a reporter-style handheld mic.",
  "Type: Handheld mic adapter|Works with: RØDE Wireless GO transmitters|Best for: Interviews and reporting|Brand: RØDE");
d("BOY-BOYA-BM2021", "A compact wireless lavalier mic with a USB-C receiver that plugs straight into your phone — plug-and-play audio upgrade for vlogs and calls.",
  "Type: Wireless lavalier mic|Connector: USB-C receiver|Best for: Smartphones, vlogs and interviews");
d("MAO-MIC-DGM20", "A USB gaming and streaming microphone with a cardioid pickup pattern and RGB lighting — plug in and go.",
  "Type: USB microphone|Pickup pattern: Cardioid|Feature: RGB lighting|Best for: Gaming and streaming");
d("MAO-MIC-PD200XS", "A dynamic podcasting microphone that rejects room noise — a warm, broadcast-style voice for podcasts and streams.",
  "Type: Dynamic microphone|Best for: Podcasting and streaming|Brand: Maono");
d("MAO-MIC-PD-400X", "A dynamic cardioid microphone with USB and XLR connections — plug into your computer today, upgrade to an audio interface later.",
  "Type: Dynamic microphone|Connections: USB + XLR|Pickup pattern: Cardioid|Best for: Podcasts and vocals");
d("MAO-MIC-DM40-PRO", "A USB microphone for streaming, voice-over and calls — clean, clear vocals with simple plug-and-play setup.",
  "Type: USB microphone|Best for: Streaming, voice-over and calls|Brand: Maono");
d("MAO-MIC-MH601", "Closed-back studio monitor headphones for mixing, recording and everyday listening.",
  "Type: Studio monitor headphones|Design: Closed-back|Best for: Recording, mixing and streaming|Brand: Maono");
d("MAO-MIC-BA37", "A desktop microphone boom arm that clamps to your desk and keeps your mic where you want it, out of the way.",
  "Type: Microphone boom arm|Mounting: Desk clamp|Best for: Podcasting and streaming|Brand: Maono");
d("MAO-MIC-BA92", "A sturdy metal desktop boom arm for microphones — smooth positioning and a clean desk.",
  "Type: Microphone boom arm|Mounting: Desk clamp|Build: Metal|Brand: Maono");
d("MAO-MIC-PD200WT", "The white edition of the PD200 dynamic podcasting microphone — the same broadcast-style sound in a clean white finish.",
  "Type: Dynamic microphone|Colour: White|Best for: Podcasting and streaming|Brand: Maono");
d("MAO-MIC-T5-PA3", "A wireless lavalier microphone system for creators — clip on and record clear audio to your phone or camera.",
  "Type: Wireless lavalier mic|Best for: Vlogs and interviews|Brand: Maono");
d("MAO-AUDIO-AMEZA", "AmpliGame microphone for gaming, streaming and podcasts — clear voice capture for content creators. Ask us on WhatsApp for the exact model details.",
  "Type: Microphone|Series: AmpliGame|Best for: Gaming and streaming");
d("MAO-AUDIO-G1-NEO", "AmpliGame G1 Neo microphone for gaming and streaming — a simple, affordable way to sound better online.",
  "Type: Microphone|Series: AmpliGame G1 Neo|Best for: Gaming and streaming");
d("MAO-AUDIO-E2-GEN2", "AmpliGame E2 Gen 2 microphone for gaming and streaming — clear voice capture at a friendly price.",
  "Type: Microphone|Series: AmpliGame E2 Gen 2|Best for: Gaming and streaming");

// ---------------------------------------------------------------- Soundbars & speakers
d("MISC-S100", "An entry-level soundbar that gives your TV clearer dialogue and fuller sound than built-in speakers. Ask us on WhatsApp to confirm the exact brand and model in stock.", "Type: Soundbar|Best for: Upgrading TV sound");
d("MISC-S20R", "A soundbar system with rear speakers for surround sound at home. Ask us on WhatsApp to confirm the exact brand and model in stock.", "Type: Soundbar system|Feature: Rear speakers for surround sound");
d("SNY-S400", "Sony HT-S400 2.1ch soundbar with a wireless subwoofer for deep bass — a big upgrade over TV speakers, with Bluetooth streaming.",
  "Type: 2.1ch soundbar|Subwoofer: Wireless|Connectivity: HDMI ARC, Bluetooth, optical|Brand: Sony");
d("MISC-S40R", "A soundbar system with wireless rear speakers for real surround sound. Ask us on WhatsApp to confirm the exact brand and model in stock.", "Type: Soundbar system|Feature: Rear speakers for surround sound");
d("MISC-S500", "A powerful soundbar system with a subwoofer for cinema-style sound at home. Ask us on WhatsApp to confirm the exact brand and model in stock.", "Type: Soundbar system|Feature: Subwoofer");
d("MISC-S700", "A high-power surround-sound soundbar system for a home-cinema feel. Ask us on WhatsApp to confirm the exact brand and model in stock.", "Type: Soundbar system|Feature: Surround sound");
d("MISC-S-60", "A soundbar to lift your TV audio. Ask us on WhatsApp to confirm the exact brand and model in stock.", "Type: Soundbar");
d("MISC-PARTYBOX-ULT900AC", "A big JBL party speaker with powerful bass and a light show — made to fill a room or a garden.", "Type: Party speaker|Brand: JBL|Connectivity: Bluetooth|Feature: Light show");
d("JBL-2-1-MK2", "JBL Bar 2.1 Deep Bass MK2 — a 2.1 soundbar with a wireless subwoofer for punchy bass and clearer dialogue.",
  "Type: 2.1ch soundbar|Subwoofer: Wireless|Output: About 300W|Brand: JBL");
d("JBL-500MK2", "JBL Bar 500 MK2 — 5.1 channel soundbar with a wireless subwoofer and Dolby Atmos for cinematic sound.",
  "Type: 5.1ch soundbar|Subwoofer: Wireless|Audio: Dolby Atmos|Output: About 590W|Brand: JBL");
d("JBL-800MK2", "JBL Bar 800 MK2 — 5.1.2 channel Dolby Atmos soundbar with detachable wireless surround speakers and a wireless subwoofer.",
  "Type: 5.1.2ch soundbar|Audio: Dolby Atmos|Surrounds: Detachable wireless speakers|Output: About 720W|Brand: JBL");
d("JBL-1000MK2", "JBL Bar 1000 MK2 — 7.1.4 channel Dolby Atmos soundbar with detachable surrounds and a big wireless subwoofer.",
  "Type: 7.1.4ch soundbar|Audio: Dolby Atmos|Surrounds: Detachable wireless speakers|Output: About 880W|Brand: JBL");
d("JBL-1300MK2", "JBL Bar 1300 MK2 — the flagship 11.1.4 channel Dolby Atmos soundbar for a true home-cinema experience.",
  "Type: 11.1.4ch soundbar|Audio: Dolby Atmos|Surrounds: Detachable wireless speakers|Output: About 1170W|Brand: JBL");
d("JBL-130", "JBL PartyBox 130 — a portable party speaker with punchy bass, a light show and mic/guitar inputs.", "Type: Party speaker|Brand: JBL|Connectivity: Bluetooth|Feature: Light show, mic/guitar input");
d("JBL-320", "JBL PartyBox Stage 320 — a portable party speaker with big sound, a light show and mic/guitar inputs.", "Type: Party speaker|Brand: JBL|Connectivity: Bluetooth|Feature: Light show, mic/guitar input");
d("JBL-520", "JBL PartyBox Stage 520 — a high-power party speaker with a light show and mic/guitar inputs for big gatherings.", "Type: Party speaker|Brand: JBL|Connectivity: Bluetooth|Feature: Light show, mic/guitar input");
d("JBL-BOOMBOX-4-BLACK", "JBL Boombox 4 — a big, rugged portable Bluetooth speaker with huge bass and a waterproof, dustproof build.", "Type: Portable Bluetooth speaker|Brand: JBL|Protection: IP67 waterproof and dustproof|Colour: Black");
d("HK-GO-PLAY-3-BLACK", "Harman Kardon Go + Play 3 — a stylish portable Bluetooth speaker with rich, room-filling sound. Black.", "Type: Portable Bluetooth speaker|Brand: Harman Kardon|Colour: Black");
d("HK-GO-PLAY-3-GREY", "Harman Kardon Go + Play 3 — a stylish portable Bluetooth speaker with rich, room-filling sound. Grey.", "Type: Portable Bluetooth speaker|Brand: Harman Kardon|Colour: Grey");
d("HK-STUDIO-9", "Harman Kardon Onyx Studio 9 — an elegant Bluetooth speaker with premium, room-filling sound.", "Type: Portable Bluetooth speaker|Brand: Harman Kardon|Design: Onyx Studio series");
d("SNY-WH-CH520", "Sony WH-CH520 wireless on-ear headphones — up to 50 hours of battery life, comfortable all-day fit and clear calls.",
  "Type: Wireless on-ear headphones|Battery: Up to 50 hours|Connectivity: Bluetooth|Brand: Sony");
d("SNY-SONY-G300", "Sony G300 series audio product. Ask us on WhatsApp to confirm the exact model details in stock.", "Brand: Sony|Series: G300");
d("LG-LG-LHD-457-HOME-THEATER", "LG LHD457 Bluetooth home theatre system — fill the room with sound for movies and music, with Bluetooth streaming.", "Type: Home theatre system|Brand: LG|Connectivity: Bluetooth");

// ---------------------------------------------------------------- Accessories
d("DJI-DJI-OSMO-MOBILE-6", "A 3-axis smartphone gimbal with a built-in extension rod and ActiveTrack subject tracking — smooth, steady phone video wherever you go. Folds small.",
  "Type: Smartphone gimbal|Stabilisation: 3-axis|Tracking: ActiveTrack 5.0|Feature: Built-in extension rod|Foldable: Yes");
d("DJI-DJI-OSMO-MOBILE-8", "DJI's newest Osmo Mobile smartphone gimbal for smooth, steady phone video. Ask us on WhatsApp for the full specification.", "Type: Smartphone gimbal|Brand: DJI|Series: Osmo Mobile 8");
d("DJI-DJI-OSMO-MOBILE-8P-COMBO", "Osmo Mobile 8P combo — the Pro smartphone gimbal with extra accessories in the box for creators.", "Type: Smartphone gimbal|Brand: DJI|Series: Osmo Mobile 8P|Package: Combo");
d("DJI-DJI-OSMO-MOBILE-8P-DEVICE-ONLY", "Osmo Mobile 8P — the Pro smartphone gimbal, device only (no extra accessories).", "Type: Smartphone gimbal|Brand: DJI|Series: Osmo Mobile 8P|Package: Device only");
d("GPR-GOPRO-13-BATTERY", "GoPro Enduro rechargeable battery — longer runtime and better in cold weather. Fits HERO9 through HERO13.", "Type: Camera battery|Brand: GoPro|Series: Enduro|Fits: HERO9 to HERO13");
d("GPR-GOPRO-12-BETTERY-CHAR", "A dual battery charger plus a GoPro Enduro battery — charge two batteries at once and never miss a shot.", "Type: Charger + battery|Brand: GoPro|Includes: Dual battery charger + Enduro battery|Fits: HERO9 to HERO13");
d("GPR-GOPRO-9-13-HOUSING", "A protective housing for HERO9–HERO13 for extra protection when diving or shooting in rough conditions.", "Type: Protective housing|Brand: GoPro|Fits: HERO9 to HERO13");
d("INS-INSTA-360-X3-BATTERY", "Spare battery for the Insta360 X3 — keep shooting all day.", "Type: Camera battery|Brand: Insta360|Fits: Insta360 X3");
d("INS-INSTA-360-EXTENDED-STICK", "An extended selfie stick for 360 cameras — the stick disappears in your footage for dramatic, drone-like shots.", "Type: Selfie stick|Brand: Insta360|Feature: Extended length, invisible in 360 footage");
d("INS-INSTA-360-STICK-114C", "A 114cm invisible selfie stick for Insta360 cameras — disappears from 360 footage for floating-camera shots.", "Type: Selfie stick|Brand: Insta360|Length: 114cm|Feature: Invisible in 360 footage");
const sd = (sku, desc, cap, extra) => d(sku, desc, `Type: SD memory card|Capacity: ${cap}|${extra}`);
sd("SAN-32-GB-SD", "SanDisk 32GB SD card — dependable storage for cameras and camcorders.", "32GB", "Brand: SanDisk|Format: SDHC");
sd("SAN-64-GB-SD", "SanDisk 64GB SD card — dependable storage for photos and Full HD video.", "64GB", "Brand: SanDisk|Format: SDXC");
sd("SAN-128-GB-SD", "SanDisk 128GB SD card — plenty of space for photos and Full HD video.", "128GB", "Brand: SanDisk|Format: SDXC");
sd("SAN-64-GB", "SanDisk Extreme PRO 64GB SD card — fast read/write speeds for 4K video and burst shooting.", "64GB", "Brand: SanDisk Extreme PRO|Speed class: UHS-I, U3, V30|Video: 4K ready");
sd("SAN-128-GB", "SanDisk Extreme PRO 128GB SD card — fast read/write speeds for 4K video and burst shooting.", "128GB", "Brand: SanDisk Extreme PRO|Speed class: UHS-I, U3, V30|Video: 4K ready");
sd("LEX-64GB-SD-2", "Lexar 64GB SD card — reliable storage for photos and video.", "64GB", "Brand: Lexar|Format: SDXC");
sd("LEX-128GB-SD-2", "Lexar 128GB SD card — reliable storage for photos and video.", "128GB", "Brand: Lexar|Format: SDXC");
sd("LEX-256GB-SD", "Lexar 256GB SD card — big capacity for long shoots and 4K video.", "256GB", "Brand: Lexar|Format: SDXC");
const ms = (sku, desc, cap) => d(sku, desc, `Type: microSD card|Capacity: ${cap}|Brand: Lexar|Format: microSDXC`);
ms("LEX-64GB-MIRCO", "Lexar 64GB microSD card for phones, action cameras and drones.", "64GB");
ms("LEX-128GB-MICRO", "Lexar 128GB microSD card for phones, action cameras and drones.", "128GB");
ms("LEX-256GB-MICRO", "Lexar 256GB microSD card — big capacity for action cameras, drones and phones.", "256GB");
d("SNY-PLAYSTATION-5", "The Sony PlayStation 5 console — lightning-fast SSD loading, ray-traced graphics, 3D audio and the DualSense controller. Ask us on WhatsApp which version (disc or digital) is in stock.",
  "Type: Game console|Brand: Sony|Graphics: Ray tracing, up to 4K 120fps|Controller: DualSense wireless controller");
d("EA-FIFA-2025-CD", "EA SPORTS FC 25 for PS5 (disc) — the latest football game with all the leagues and modes.", "Type: PS5 game (disc)|Publisher: EA SPORTS|Genre: Football");
d("SNY-PS5-PADS-COLORED", "Sony DualSense wireless controller for PS5 in colour — haptic feedback, adaptive triggers and a built-in microphone.", "Type: Wireless game controller|Brand: Sony|Platform: PlayStation 5|Features: Haptic feedback, adaptive triggers, built-in mic, USB-C charging");

export const PRODUCT_DETAILS = P;

// Public names that still carried import notes.
export const NAME_FIXES = {
  "CAN-10-18-STM": "Canon EF-S 10-18mm F4.5-5.6 IS STM",
  "CAN-50MM1-8": "Canon EF 50mm F1.8 STM",
  "CAN-75-300MM": "Canon EF 75-300mm F4-5.6 III",
};
