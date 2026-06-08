import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Livro } from "./BookCard";

interface EditBookModalProps {
  book: Livro | null;
  onEditBook: (id: number, updatedBook: Omit<Livro, "id">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBookModal({ book, onEditBook, open, onOpenChange }: EditBookModalProps) {
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

  // Atualizar formData quando o livro mudar
  useEffect(() => {
    if (book) {
      setFormData({
        titulo: book.titulo,
        autor: book.autor,
        genero: book.genero,
        ano: book.ano,
        capa: book.capa,
        descricao: book.descricao,
        isbn: book.isbn || "",
        quantidade: book.quantidade ?? 1,
      });
    }
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!book) return;
    
    if (!formData.titulo || !formData.autor || !formData.genero) {
      alert("Por favor, preencha pelo menos título, autor e gênero.");
      return;
    }

    onEditBook(book.id, formData);
    onOpenChange(false);
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Livro</DialogTitle>
          <DialogDescription>
            Modifique as informações do livro.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-titulo" className="block text-sm font-medium mb-1">
              Título *
            </label>
            <input
              id="edit-titulo"
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="edit-autor" className="block text-sm font-medium mb-1">
              Autor *
            </label>
            <input
              id="edit-autor"
              type="text"
              required
              value={formData.autor}
              onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-genero" className="block text-sm font-medium mb-1">
                Gênero *
              </label>
              <input
                id="edit-genero"
                type="text"
                required
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="edit-ano" className="block text-sm font-medium mb-1">
                Ano de Publicação
              </label>
              <input
                id="edit-ano"
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
              <label htmlFor="edit-isbn" className="block text-sm font-medium mb-1">
                ISBN
              </label>
              <input
                id="edit-isbn"
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 978-3-16-148410-0"
              />
            </div>

            <div>
              <label htmlFor="edit-quantidade" className="block text-sm font-medium mb-1">
                Quantidade em Acervo
              </label>
              <input
                id="edit-quantidade"
                type="number"
                min="0"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-capa" className="block text-sm font-medium mb-1">
              Imagem da Capa
            </label>
            <input
              id="edit-capa"
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
              Selecione uma nova imagem para substituir a capa atual.
            </p>
            {formData.capa && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Preview atual:</p>
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
            <label htmlFor="edit-descricao" className="block text-sm font-medium mb-1">
              Descrição
            </label>
            <textarea
              id="edit-descricao"
              rows={4}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}