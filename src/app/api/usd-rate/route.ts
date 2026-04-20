import { NextResponse } from 'next/server';

export async function GET() {

	const res = await fetch( 'https://api.frankfurter.app/latest?from=JPY&to=USD', {
		next: { revalidate: 3600 },
	} );

	if ( ! res.ok ) {

		return NextResponse.json( { error: 'fetch failed' }, { status: 502 } );

	}

	const data = await res.json();
	const rate = data?.rates?.USD;

	if ( typeof rate !== 'number' ) {

		return NextResponse.json( { error: 'invalid rate' }, { status: 502 } );

	}

	return NextResponse.json( { rate } );

}
