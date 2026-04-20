'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface CoinDisplayProps {
	gCoins: number;
}

export default function CoinDisplay( { gCoins }: CoinDisplayProps ) {

	const [ usdRate, setUsdRate ] = useState<number | null>( null );
	const [ showUsd, setShowUsd ] = useState( false );

	useEffect( () => {

		fetch( '/api/usd-rate' )
			.then( ( res ) => res.ok ? res.json() : Promise.reject( `HTTP ${ res.status }` ) )
			.then( ( data ) => {

				if ( typeof data?.rate === 'number' ) setUsdRate( data.rate );

			} )
			.catch( ( err ) => console.error( 'USD fetch failed:', err ) );

	}, [] );

	function handleUsdToggle() {

		if ( usdRate !== null ) setShowUsd( ( v ) => ! v );

	}

	const usdAmount = usdRate !== null ? Math.round( gCoins * usdRate ) : null;

	return (
		<div className="flex flex-col items-center gap-2">
			<Image src="/logo.png" alt="がまん貯金" width={512} height={256} className="block w-full max-w-3xs mb-2" />
			<div className="text-center">
				<p className="text-lg font-bold text-yellow-700">たまった おかね</p>
				{ showUsd && usdAmount !== null ? (
					<p className="text-5xl font-black text-green-500 drop-shadow-md">
						${ usdAmount?.toLocaleString() }
						<span className="text-xl text-green-600 font-semibold">どる</span>
					</p>
				) : (
					<p className="text-5xl font-black text-yellow-500 drop-shadow-md">
						{ gCoins.toLocaleString() }
						<span className="text-xl text-yellow-600 font-semibold">えん</span>
					</p>
				) }
				{ usdRate !== null && (
					<button
						onClick={ handleUsdToggle }
						className="mt-2 text-sm cursor-pointer"
					>
						{ showUsd ? '🇯🇵' : '🇺🇸' }
					</button>
				) }
			</div>
		</div>
	);

}
