import { Calendar, Trash2, Pencil } from "lucide-react";
import { useState } from "react";

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  ano: number;
  capa: string;
  descricao: string;
  isbn?: string;
  quantidade?: number;
}

interface BookCardProps {
  livro: Livro;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
}

export function BookCard({ livro, onDelete, onEdit }: BookCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Botões de ação */}
      {showActions && (
        <div className="absolute top-2 left-2 z-10 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(livro.id)}
              className="bg-white/95 text-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
              title="Editar livro"
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Deseja realmente remover "${livro.titulo}"?`)) {
                  onDelete(livro.id);
                }
              }}
              className="bg-white/95 text-red-600 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
              title="Remover livro"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
        <img
          src={livro.capa || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400"}
          alt={`Capa do livro ${livro.titulo}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";
          }}
        />
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            {livro.genero}
          </span>
          {livro.quantidade !== undefined && livro.quantidade !== null && (
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              {livro.quantidade} em acervo
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">
          {livro.titulo}
        </h3>
        <p className="text-gray-600 text-sm mb-2">
          {livro.autor}
        </p>
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
          <Calendar size={14} />
          <span>{livro.ano}</span>
        </div>
        {livro.isbn && (
          <p className="text-gray-400 text-xs mb-3 font-mono">
            ISBN: {livro.isbn}
          </p>
        )}
        <div className="flex-grow">
          <p className={`text-gray-700 text-sm ${expanded ? "" : "line-clamp-3"}`}>
            {livro.descricao}
          </p>
          {livro.descricao && livro.descricao.length > 100 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 text-xs mt-1 hover:underline"
            >
              {expanded ? "Ver menos" : "Ver mais"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}