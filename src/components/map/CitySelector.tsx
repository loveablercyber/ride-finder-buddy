
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CitySelectorProps {
  onCitySelect: (city: string) => void;
}

// Lista de cidades por estado (simplificada)
const CITIES_BY_STATE: Record<string, string[]> = {
  'São Paulo': ['São Paulo', 'Campinas', 'Santos', 'Guarulhos', 'Ribeirão Preto'],
  'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Angra dos Reis', 'Nova Iguaçu'],
  'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Contagem', 'Betim'],
  'Bahia': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna'],
  'Paraná': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
  'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
};

// Lista de estados disponíveis
const STATES = Object.keys(CITIES_BY_STATE);

const CitySelector: React.FC<CitySelectorProps> = ({ onCitySelect }) => {
  const [selectedState, setSelectedState] = useState<string>(STATES[0]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>(CITIES_BY_STATE[STATES[0]]);

  // Atualiza a lista de cidades quando o estado é alterado
  useEffect(() => {
    const cities = CITIES_BY_STATE[selectedState] || [];
    setAvailableCities(cities);
    setSelectedCity('');
  }, [selectedState]);

  // Notifica o componente pai quando uma cidade é selecionada
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onCitySelect(city);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="state-select">Estado</Label>
        <Select 
          value={selectedState} 
          onValueChange={setSelectedState}
        >
          <SelectTrigger id="state-select">
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent>
            {STATES.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city-select">Cidade</Label>
        <Select 
          value={selectedCity} 
          onValueChange={handleCityChange}
        >
          <SelectTrigger id="city-select">
            <SelectValue placeholder="Selecione uma cidade" />
          </SelectTrigger>
          <SelectContent>
            {availableCities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CitySelector;
