const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

const newProductTypes = [
  {
    name: 'V-Neck',
    category: 'V-Neck',
    description: 'Sleek V-neck t-shirt with a modern tailored cut, perfect for layering or standalone wear.',
    basePrice: 1099,
    garmentImages: {
      front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342172/v-neck-black-front_pnt0pc.png',
      back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342171/v-neck-black-back_dbwznd.png',
      left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342171/v-neck-black-left_pgypln.png',
      right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342167/v-neck-black-right_yvopz5.png',
      byColour: {
        'Black': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342172/v-neck-black-front_pnt0pc.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342171/v-neck-black-back_dbwznd.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342171/v-neck-black-left_pgypln.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342167/v-neck-black-right_yvopz5.png',
        },
        'White': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342165/v-neck-white-front_fsasnv.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342200/v-neck-white-back_nasmbz.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342171/v-neck-white-left_uwqv6o.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342171/v-neck-white-right_vitwpx.png',
        },
        'Navy Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342182/v-neck-navy-blue-front_mqo8ed.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342180/v-neck-navy-blue-back_b5qw1b.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342189/v-neck-navy-blue-left_tu51kh.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342184/v-neck-navy-blue-right_z5axbo.png',
        },
        'Sky Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342191/v-neck-sky-blue-front_smfoxa.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342190/v-neck-sky-blue-back_cjmfaa.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342193/v-neck-sky-blue-left_mmu4vd.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342194/v-neck-sky-blue-right_fszpme.png',
        },
        'Maroon': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342177/v-neck-maroon-front_guvo1b.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342176/v-neck-maroon-back_tc85be.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342181/v-neck-maroon-left_lzihno.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342179/v-neck-maroon-right_lhgwjr.png',
        },
        'Grey': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342173/v-neck-grey-front_glhri8.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342170/v-neck-grey-back_jycvjf.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342178/v-neck-grey-left_mge6fo.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342179/v-neck-grey-right_qexqxl.png',
        },
        'Olive Green': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342186/v-neck-olive-green-front_u3umy9.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342184/v-neck-olive-green-back_vyezci.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342187/v-neck-olive-green-left_f4enur.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342189/v-neck-olive-green-right_nyaao6.png',
        },
        'Soft Pink': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342205/v-neck-soft-pink-front_rfiehf.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342196/v-neck-soft-pink-back_a7bakv.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342197/v-neck-soft-pink-left_tdswep.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790342200/v-neck-soft-pink-right_vjzb61.png',
        },
      },
    },
    images: ['https://res.cloudinary.com/dbkt9hcro/image/upload/v1790348215/anivom/products/display/vneck_display_model.jpg'],
    colours: ['Black', 'White', 'Navy Blue', 'Sky Blue', 'Maroon', 'Grey', 'Olive Green', 'Soft Pink'],
  },
  {
    name: 'Slim Fit',
    category: 'Slim Fit',
    description: 'Form-fitting slim t-shirt designed with elastane-infused cotton for flexible movement and sharp contour.',
    basePrice: 1199,
    garmentImages: {
      front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-front_xmwgos.png',
      back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-back_zjkljy.png',
      left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-left_e3pht8.png',
      right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-right_bxsvef.png',
      byColour: {
        'White': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-front_xmwgos.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-back_zjkljy.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-left_e3pht8.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338620/slim-fit-white-right_bxsvef.png',
        },
        'Navy Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338604/slim-fit-navy-blue-front_vgtuiq.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338604/slim-fit-navy-blue-back_mzy5as.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338604/slim-fit-navy-blue-left_fadeyv.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338604/slim-fit-navy-blue-right_djoxua.png',
        },
        'Sky Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-sky-blue-front_z90s9o.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-sky-blue-back_kpvgqr.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-sky-blue-left_pd4dba.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-sky-blue-right_pcg3fd.png',
        },
        'Maroon': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338603/slim-fit-maroon-front_ccmkht.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338603/slim-fit-maroon-back_jbtuwa.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338604/slim-fit-maroon-left_nirdrl.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338604/slim-fit-maroon-right_azs7nx.png',
        },
        'Grey': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338603/slim-fit-grey-front_gjhkqd.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338603/slim-fit-grey-back_ktbabv.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338603/slim-fit-grey-left_jhhi9z.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338603/slim-fit-grey-right_ylg7hn.png',
        },
        'Olive Green': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-olive-green-front_skrkbp.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338604/slim-fit-olive-green-back_uqei6y.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-olive-green-left_tmrbzt.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-olive-green-right_tmxjqe.png',
        },
        'Soft Pink': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338606/slim-fit-soft-pink-front_xxv14m.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338605/slim-fit-soft-pink-back_rumulw.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338606/slim-fit-soft-pink-left_v3vvys.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790338606/slim-fit-soft-pink-right_o2n6ue.png',
        },
      },
    },
    images: ['https://res.cloudinary.com/dbkt9hcro/image/upload/v1790348213/anivom/products/display/slimfit_display_model.jpg'],
    colours: ['White', 'Navy Blue', 'Sky Blue', 'Maroon', 'Grey', 'Olive Green', 'Soft Pink'],
  },
  {
    name: 'Oversized',
    category: 'Oversized',
    description: 'Heavyweight drop-shoulder oversized t-shirt boasting a trendy boxy fit and street-lux aesthetic.',
    basePrice: 1499,
    garmentImages: {
      front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343924/oversized-black-front_alria0.png',
      back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343925/oversized-black-back_oxv2vi.png',
      left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343924/oversized-black-left_r7uhuj.png',
      right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343923/oversized-black-right_yfwpcy.png',
      byColour: {
        'Black': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343924/oversized-black-front_alria0.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343925/oversized-black-back_oxv2vi.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343924/oversized-black-left_r7uhuj.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343923/oversized-black-right_yfwpcy.png',
        },
        'White': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344668/oversized-white-front_sokrtm.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344669/oversized-white-back_doz28h.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345911/oversized-white-left_parb3g.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345911/oversized-white-right_martns.png',
        },
        'Navy Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344015/oversized-navy-blue-front_sgdndz.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344014/oversized-navy-blue-back_dqh2gj.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344014/oversized-navy-blue-left_lfffie.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344014/oversized-navy-blue-right_hq4vkj.png',
        },
        'Grey': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343927/oversized-grey-front_j2fvrb.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343927/oversized-grey-back_a9ufqo.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343927/oversized-grey-left_nxtyl6.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343927/oversized-grey-right_mdvqjk.png',
        },
        'Olive Green': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344016/oversized-olive-green-front_uxul22.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344015/oversized-olive-green-back_bbdmrc.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344016/oversized-olive-green-left_z8takn.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344218/oversized-olive-green-right_kq4ffu.png',
        },
        'Cream': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343925/oversized-cream-front_wbyxqt.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343925/oversized-cream-back_ogbiuv.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343924/oversized-cream-left_eljegc.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790343926/oversized-cream-right_beqbmc.png',
        },
        'Mustard': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344011/oversized-mustard-front_svezpg.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344015/oversized-mustard-back_wjwuha.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344012/oversized-mustard-left_gr7huy.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344012/oversized-mustard-right_vkxl39.png',
        },
        'Sky Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344667/oversized-sky-blue-front_uw7eph.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344667/oversized-sky-blue-back_sslzaz.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344669/oversized-sky-blue-left_zducij.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344668/oversized-sky-blue-right_yytcud.png',
        },
        'Wine': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345913/oversized-wine-front_lewjkg.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345912/oversized-wine-back_xqtd7o.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345913/oversized-wine-left_clxc09.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345913/oversized-wine-right_dwggbj.png',
        },
        'Purple': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344274/oversized-purple-front_ingcom.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344218/oversized-purple-back_jtt8zm.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344665/oversized-purple-left_xcmvc5.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790344666/oversized-purple-right_bzbaw3.png',
        },
      },
    },
    images: ['https://res.cloudinary.com/dbkt9hcro/image/upload/v1790348211/anivom/products/display/oversized_display_model.jpg'],
    colours: ['Black', 'White', 'Navy Blue', 'Grey', 'Olive Green', 'Cream', 'Mustard', 'Sky Blue', 'Wine', 'Purple'],
  },
  {
    name: 'Cropped',
    category: 'Cropped',
    description: 'Modern cropped style t-shirt with a raw hem trim and relaxed casual upper body silhouette.',
    basePrice: 999,
    garmentImages: {
      front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346010/cropped_black_front_view_kwqgk4.png',
      back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346009/cropped_black_back_view_ckhx0w.png',
      left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346011/cropped_black_left_view_jnxgix.png',
      right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346248/cropped_black_right_view_uxjmzw.png',
      byColour: {
        'Black': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346010/cropped_black_front_view_kwqgk4.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346009/cropped_black_back_view_ckhx0w.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346011/cropped_black_left_view_jnxgix.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346248/cropped_black_right_view_uxjmzw.png',
        },
        'White': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345948/cropped_white_front_view_wgdp8u.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345947/cropped_white_back_view_ec3nux.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345947/cropped_white_left_view_qmb8uc.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345947/cropped_white_right_view_irrbsi.png',
        },
        'Maroon': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345953/cropped_maroon_front_view_xpmsp1.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790346008/cropped_maroon_back_view_opm14f.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345952/cropped_maroon_left_view_hjcahu.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790345953/cropped_maroon_right_view_gzbzmz.png',
        },
      },
    },
    images: ['https://res.cloudinary.com/dbkt9hcro/image/upload/v1790348208/anivom/products/display/cropped_display_model.jpg'],
    colours: ['Black', 'White', 'Maroon'],
  },
  {
    name: 'Polo',
    category: 'Polo',
    description: 'Classic polo neck shirt crafted with refined pique knit cotton, structured collar, and button placket.',
    basePrice: 1299,
    garmentImages: {
      front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-front_y82xzd.png',
      back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-back_xziwaq.png',
      left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-left_vffelk.png',
      right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-right_hkisjm.png',
      byColour: {
        'Black': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-front_y82xzd.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-back_xziwaq.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-left_vffelk.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-right_hkisjm.png',
        },
        'Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-blue-front_zgky4x.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-blue-back_qemkdc.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355363/polo-blue-left_f5gbrz.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355363/polo-blue-right_wsbjqp.png',
        },
        'Green': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355363/polo-green-front_wev5dq.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355363/polo-green-back_yqurcx.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355364/polo-green-left_cvhsbh.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355363/polo-green-right_yhkgmd.png',
        },
        'Maroon': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355387/polo-maroon-front_ry64ev.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355363/polo-maroon-back_eqxrw6.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355387/polo-maroon-left_erhkkr.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355388/polo-maroon-right_kqnqbp.png',
        },
        'White': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355388/polo-white-front_fifdnl.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355388/polo-white-back_kwscoz.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355413/polo-white-left_ubpu20.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355414/polo-white-right_zatuco.png',
        },
        'Yellow': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355414/polo-yellow-front_uf7gaw.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355414/polo-yellow-back_w9j2cs.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355414/polo-yellow-left_mtbpdu.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355415/polo-yellow-right_gug3uf.png',
        },
      },
    },
    images: ['https://res.cloudinary.com/dbkt9hcro/image/upload/v1790355362/polo-black-front_y82xzd.png'],
    colours: ['Black', 'Blue', 'Green', 'Maroon', 'White', 'Yellow'],
  },
  {
    name: 'Sleeveless',
    category: 'Sleeveless',
    description: 'Athletic cut armless tank tee crafted with lightweight breathable combed cotton for unrestricted movement.',
    basePrice: 899,
    garmentImages: {
      front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358628/sleeveless-black-front_lsu9bw.png',
      back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358628/sleeveless-black-back_ccf5xg.png',
      byColour: {
        'Black': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358628/sleeveless-black-front_lsu9bw.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358628/sleeveless-black-back_ccf5xg.png',
        },
        'Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358629/sleeveless-blue-front_zxsahh.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358629/sleeveless-blue-back_xcyvq2.png',
        },
        'Green': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358630/sleeveless-green-front_wzrkuh.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358630/sleeveless-green-back_osvpe3.png',
        },
        'Pink': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358772/sleeveless-pink-front_gszlbd.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358771/sleeveless-pink-back_u0pbfq.png',
        },
        'White': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358772/sleeveless-white-front_hywrku.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358771/sleeveless-white-back_hy1q8k.png',
        },
        'Yellow': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358773/sleeveless-yellow-front_kmh32i.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358774/sleeveless-yellow-back_xsrrop.png',
        },
      },
    },
    images: ['https://res.cloudinary.com/dbkt9hcro/image/upload/v1790358628/sleeveless-black-front_lsu9bw.png'],
    colours: ['Black', 'Blue', 'Green', 'Pink', 'White', 'Yellow'],
  },
  {
    name: 'Full Sleeve',
    category: 'Full Sleeve',
    description: 'Premium full sleeve t-shirt crafted from rich combed cotton for warmth, structured silhouette, and all-day comfort.',
    basePrice: 1299,
    garmentImages: {
      front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-front_ptxokc.png',
      back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360282/fullsleve-black-back_w1ohon.png',
      left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-left_jkanl4.png',
      right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-right_n9dycn.png',
      byColour: {
        'Black': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-front_ptxokc.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360282/fullsleve-black-back_w1ohon.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-left_jkanl4.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-right_n9dycn.png',
        },
        'Blue': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360286/fullsleve-blue-front_mvxx1a.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360285/fullsleve-blue-back_i1abp9.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360284/fullsleve-blue-left_hb7jdx.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360284/fullsleve-blue-right_uuatov.png',
        },
        'Green': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360287/fullsleve-green-front_ezt5z1.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360286/fullsleve-green-back_djka52.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360286/fullsleve-green-left_m08pmg.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360288/fullsleve-green-right_gidxtp.png',
        },
        'Grey': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360287/fullsleve-grey-front_vhccbj.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360286/fullslevee-grey-front_2_p3edim.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360288/fullsleve-grey-left_gtmwjn.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360288/fullsleve-grey-right_bkpu0r.png',
        },
        'Maroon': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360290/fullsleve-maroon-front_liyt6m.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360289/fullsleve-maroon-back_ecjrv4.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360289/fullsleve-maroon-left_xtqy5k.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360289/fullsleve-maroon-right_jy7h8h.png',
        },
        'Yellow': {
          front: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360292/fullsleve-yellow-front_pgf5mk.png',
          back: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360289/fullsleve-yellow-back_zlalgw.png',
          left: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360290/fullsleve-yellow-left_e7foa6.png',
          right: 'https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360291/fullsleve-yellow-right_i8paaq.png',
        },
      },
    },
    images: ['https://res.cloudinary.com/dbkt9hcro/image/upload/v1790360283/fullsleve-black-front_ptxokc.png'],
    colours: ['Black', 'Blue', 'Green', 'Grey', 'Maroon', 'Yellow'],
  },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function generateVariants(colours) {
  const variants = [];
  for (const colour of colours) {
    for (const size of sizes) {
      variants.push({
        size,
        colour,
        stock: 25,
      });
    }
  }
  return variants;
}

async function seedProducts() {
  try {
    await connectDB();

    console.log('Connected to MongoDB.');

    // 1. Find all product IDs referenced in existing orders
    const orders = await Order.find({}, 'items.product');
    const orderedProductIds = new Set();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item.product) {
          orderedProductIds.add(item.product.toString());
        }
      });
    });

    console.log(`Found ${orderedProductIds.size} unique product ID(s) referenced in historical orders.`);

    // 2. Identify active seed products to replace/deactivate
    const targetProductNames = newProductTypes.map((p) => p.name);

    // Deactivate or safely soft-delete old active products not in the new set
    const obsoleteProducts = await Product.find({
      name: { $nin: targetProductNames },
    });

    let softDeletedCount = 0;
    let hardDeletedCount = 0;

    for (const prod of obsoleteProducts) {
      if (orderedProductIds.has(prod._id.toString())) {
        // Soft delete / deactivate so historical orders referencing this product remain intact
        prod.isActive = false;
        await prod.save();
        softDeletedCount++;
      } else {
        // Hard delete non-ordered obsolete product
        await Product.deleteOne({ _id: prod._id });
        hardDeletedCount++;
      }
    }

    console.log(`Obsolete products handled: ${softDeletedCount} soft-deleted/deactivated (referenced in historical orders), ${hardDeletedCount} hard-deleted.`);

    // 3. Upsert / seed the 4 target active product types without creating duplicates
    let createdCount = 0;
    let updatedCount = 0;

    for (const pTypeDef of newProductTypes) {
      const variants = generateVariants(pTypeDef.colours);

      const productPayload = {
        name: pTypeDef.name,
        description: pTypeDef.description,
        category: pTypeDef.category,
        basePrice: pTypeDef.basePrice,
        garmentImages: pTypeDef.garmentImages,
        images: pTypeDef.images,
        variants,
        isActive: true,
      };

      const existing = await Product.findOne({ name: pTypeDef.name });

      if (existing) {
        Object.assign(existing, productPayload);
        existing.markModified('garmentImages');
        await existing.save();
        updatedCount++;
      } else {
        await Product.create(productPayload);
        createdCount++;
      }
    }

    console.log(`Seed execution complete: ${createdCount} created, ${updatedCount} updated.`);

    await mongoose.disconnect();
    console.log('Database connection closed successfully.');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during product seeding:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
}

if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, newProductTypes };
