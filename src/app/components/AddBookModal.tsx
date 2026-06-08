import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Livro } from "./BookCard";

interface AddBookModalProps {
  onAddBook: (book: Omit<Livro, "id">) => void;
}

export function AddBookModal({ onAddBook }: AddBookModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    genero: "",
    ano: new Date().getFullYear(),
    capa: "",
    descricao: "",
    isbn: "",
    quantidade: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.autor || !formData.genero) {
      alert("Por favor, preencha pelo menos título, autor e gênero.");
      return;
    }

    const bookData: Omit<Livro, "id"> = {
      titulo: formData.titulo,
      autor: formData.autor,
      genero: formData.genero,
      ano: formData.ano,
      capa: formData.capa,
      descricao: formData.descricao,
      quantidade: formData.quantidade,
      ...(formData.isbn ? { isbn: formData.isbn } : {}),
    };
    onAddBook(bookData);
    
    // Reset form
    setFormData({
      titulo: "",
      autor: "",
      genero: "",
      ano: new Date().getFullYear(),
      capa: "",
      descricao: "",
      isbn: "",
      quantidade: 1,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Adicionar Livro
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Livro</DialogTitle>
          <DialogDescription>
            Preencha as informações do livro que deseja adicionar ao catálogo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium mb-1">
              Título *
            </label>
            <input
              id="titulo"
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: O Pequeno Príncipe"
            />
          </div>

          <div>
            <label htmlFor="autor" className="block text-sm font-medium mb-1">
              Autor *
            </label>
            <input
              id="autor"
              type="text"
              required
              value={formData.autor}
              onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Antoine de Saint-Exupéry"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="genero" className="block text-sm font-medium mb-1">
                Gênero *
              </label>
              <input
                id="genero"
                type="text"
                required
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Fábula"
              />
            </div>

            <div>
              <label htmlFor="ano" className="block text-sm font-medium mb-1">
                Ano de Publicação
              </label>
              <input
                id="ano"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium mb-1">
                ISBN
              </label>
              <input
                id="isbn"
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 978-3-16-148410-0"
              />
            </div>

            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium mb-1">
                Quantidade em Acervo
              </label>
              <input
                id="quantidade"
                type="number"
                min="0"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="capa" className="block text-sm font-medium mb-1">
              Imagem da Capa
            </label>
            <input
              id="capa"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, capa: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Selecione uma imagem do seu dispositivo. Se deixar em branco, usará uma imagem padrão.
            </p>
            {formData.capa && (
              <div className="mt-2">
                <img
                  src={formData.capa}
                  alt="Preview da capa"
                  className="w-32 h-48 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="descricao" className="block text-sm font-medium mb-1">
              Descrição
            </label>
            <textarea
              id="descricao"
              rows={4}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escreva uma breve sinopse do livro..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Adicionar Livro
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
