
import ProductDetail from './ProductDetail';

export async function generateStaticParams() {
  return [
    // Electronics products
    { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' },
    { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' }, { id: '11' }, { id: '12' },
    { id: 'e13' }, { id: 'e14' }, { id: 'e15' }, { id: 'e16' }, { id: 'e17' }, { id: 'e18' },
    { id: 'e19' }, { id: 'e20' }, { id: 'e21' }, { id: 'e22' }, { id: 'e23' }, { id: 'e24' },
    { id: 'e25' }, { id: 'e26' }, { id: 'e27' }, { id: 'e28' }, { id: 'e29' }, { id: 'e30' },
    { id: 'e31' }, { id: 'e32' }, { id: 'e33' }, { id: 'e34' }, { id: 'e35' }, { id: 'e36' },
    
    // Fashion products
    { id: 'f1' }, { id: 'f2' }, { id: 'f3' }, { id: 'f4' }, { id: 'f5' }, { id: 'f6' },
    { id: 'f7' }, { id: 'f8' }, { id: 'f9' }, { id: 'f10' }, { id: 'f11' }, { id: 'f12' },
    { id: 'f13' }, { id: 'f14' }, { id: 'f15' }, { id: 'f16' }, { id: 'f17' }, { id: 'f18' },
    { id: 'f19' }, { id: 'f20' }, { id: 'f21' }, { id: 'f22' }, { id: 'f23' }, { id: 'f24' },
    { id: 'f25' }, { id: 'f26' }, { id: 'f27' }, { id: 'f28' }, { id: 'f29' }, { id: 'f30' },
    { id: 'f31' }, { id: 'f32' }, { id: 'f33' }, { id: 'f34' }, { id: 'f35' }, { id: 'f36' },
    
    // Books products
    { id: 'b1' }, { id: 'b2' }, { id: 'b3' }, { id: 'b4' }, { id: 'b5' }, { id: 'b6' },
    { id: 'b7' }, { id: 'b8' }, { id: 'b9' }, { id: 'b10' }, { id: 'b11' }, { id: 'b12' },
    { id: 'b13' }, { id: 'b14' }, { id: 'b15' }, { id: 'b16' }, { id: 'b17' }, { id: 'b18' },
    { id: 'b19' }, { id: 'b20' }, { id: 'b21' }, { id: 'b22' }, { id: 'b23' }, { id: 'b24' },
    { id: 'b25' }, { id: 'b26' }, { id: 'b27' }, { id: 'b28' }, { id: 'b29' }, { id: 'b30' },
    { id: 'b31' }, { id: 'b32' }, { id: 'b33' }, { id: 'b34' }, { id: 'b35' }, { id: 'b36' },
    
    // Home products
    { id: 'h1' }, { id: 'h2' }, { id: 'h3' }, { id: 'h4' }, { id: 'h5' }, { id: 'h6' },
    { id: 'h7' }, { id: 'h8' }, { id: 'h9' }, { id: 'h10' }, { id: 'h11' }, { id: 'h12' },
    { id: 'h13' }, { id: 'h14' }, { id: 'h15' }, { id: 'h16' }, { id: 'h17' }, { id: 'h18' },
    { id: 'h19' }, { id: 'h20' }, { id: 'h21' }, { id: 'h22' }, { id: 'h23' }, { id: 'h24' },
    { id: 'h25' }, { id: 'h26' }, { id: 'h27' }, { id: 'h28' }, { id: 'h29' }, { id: 'h30' },
    { id: 'h31' }, { id: 'h32' }, { id: 'h33' }, { id: 'h34' }, { id: 'h35' }, { id: 'h36' },
    
    // Sports products
    { id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 's4' }, { id: 's5' }, { id: 's6' },
    { id: 's7' }, { id: 's8' }, { id: 's9' }, { id: 's10' }, { id: 's11' }, { id: 's12' },
    { id: 's13' }, { id: 's14' }, { id: 's15' }, { id: 's16' }, { id: 's17' }, { id: 's18' },
    { id: 's19' }, { id: 's20' }, { id: 's21' }, { id: 's22' }, { id: 's23' }, { id: 's24' },
    { id: 's25' }, { id: 's26' }, { id: 's27' }, { id: 's28' }, { id: 's29' }, { id: 's30' },
    { id: 's31' }, { id: 's32' }, { id: 's33' }, { id: 's34' }, { id: 's35' }, { id: 's36' },
    
    // Grocery products
    { id: 'g1' }, { id: 'g2' }, { id: 'g3' }, { id: 'g4' }, { id: 'g5' }, { id: 'g6' },
    { id: 'g7' }, { id: 'g8' }, { id: 'g9' }, { id: 'g10' }, { id: 'g11' }, { id: 'g12' },
    { id: 'g13' }, { id: 'g14' }, { id: 'g15' }, { id: 'g16' }, { id: 'g17' }, { id: 'g18' },
    { id: 'g19' }, { id: 'g20' }, { id: 'g21' }, { id: 'g22' }, { id: 'g23' }, { id: 'g24' },
    { id: 'g25' }, { id: 'g26' }, { id: 'g27' }, { id: 'g28' }, { id: 'g29' }, { id: 'g30' },
    { id: 'g31' }, { id: 'g32' }, { id: 'g33' }, { id: 'g34' }, { id: 'g35' }, { id: 'g36' },
    
    // Appliances products
    { id: 'a1' }, { id: 'a2' }, { id: 'a3' }, { id: 'a4' }, { id: 'a5' }, { id: 'a6' },
    { id: 'a7' }, { id: 'a8' }, { id: 'a9' }, { id: 'a10' }, { id: 'a11' }, { id: 'a12' },
    { id: 'a13' }, { id: 'a14' }, { id: 'a15' }, { id: 'a16' }, { id: 'a17' }, { id: 'a18' },
    { id: 'a19' }, { id: 'a20' }, { id: 'a21' }, { id: 'a22' }, { id: 'a23' }, { id: 'a24' },
    { id: 'a25' }, { id: 'a26' }, { id: 'a27' }, { id: 'a28' }, { id: 'a29' }, { id: 'a30' },
    { id: 'a31' }, { id: 'a32' }, { id: 'a33' }, { id: 'a34' }, { id: 'a35' }, { id: 'a36' },
    
    // Beauty products
    { id: 'be1' }, { id: 'be2' }, { id: 'be3' }, { id: 'be4' }, { id: 'be5' }, { id: 'be6' },
    { id: 'be7' }, { id: 'be8' }, { id: 'be9' }, { id: 'be10' }, { id: 'be11' }, { id: 'be12' },
    { id: 'be13' }, { id: 'be14' }, { id: 'be15' }, { id: 'be16' }, { id: 'be17' }, { id: 'be18' },
    { id: 'be19' }, { id: 'be20' }, { id: 'be21' }, { id: 'be22' }, { id: 'be23' }, { id: 'be24' },
    { id: 'be25' }, { id: 'be26' }, { id: 'be27' }, { id: 'be28' }, { id: 'be29' }, { id: 'be30' },
    { id: 'be31' }, { id: 'be32' }, { id: 'be33' }, { id: 'be34' }, { id: 'be35' }, { id: 'be36' },
    
    // Solar products
    { id: 'so1' }, { id: 'so2' }, { id: 'so3' }, { id: 'so4' }, { id: 'so5' }, { id: 'so6' },
    { id: 'so7' }, { id: 'so8' }, { id: 'so9' }, { id: 'so10' }, { id: 'so11' }, { id: 'so12' },
    { id: 'so13' }, { id: 'so14' }, { id: 'so15' }, { id: 'so16' }, { id: 'so17' }, { id: 'so18' },
    { id: 'so19' }, { id: 'so20' }, { id: 'so21' }, { id: 'so22' }, { id: 'so23' }, { id: 'so24' },
    { id: 'so25' }, { id: 'so26' }, { id: 'so27' }, { id: 'so28' }, { id: 'so29' }, { id: 'so30' },
    { id: 'so31' }, { id: 'so32' }, { id: 'so33' }, { id: 'so34' }, { id: 'so35' }, { id: 'so36' },
    
    // Pharmacy products
    { id: 'ph1' }, { id: 'ph2' }, { id: 'ph3' }, { id: 'ph4' }, { id: 'ph5' }, { id: 'ph6' },
    { id: 'ph7' }, { id: 'ph8' }, { id: 'ph9' }, { id: 'ph10' }, { id: 'ph11' }, { id: 'ph12' },
    { id: 'ph13' }, { id: 'ph14' }, { id: 'ph15' }, { id: 'ph16' }, { id: 'ph17' }, { id: 'ph18' },
    { id: 'ph19' }, { id: 'ph20' }, { id: 'ph21' }, { id: 'ph22' }, { id: 'ph23' }, { id: 'ph24' },
    { id: 'ph25' }, { id: 'ph26' }, { id: 'ph27' }, { id: 'ph28' }, { id: 'ph29' }, { id: 'ph30' },
    { id: 'ph31' }, { id: 'ph32' }, { id: 'ph33' }, { id: 'ph34' }, { id: 'ph35' }, { id: 'ph36' }
  ];
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetail productId={params.id} />;
}
