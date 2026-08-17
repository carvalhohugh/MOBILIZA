import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
      <p className="text-neutral-500 font-medium">Carregando Mapa do Brasil...</p>
    </div>
  )
});

export default Map;
