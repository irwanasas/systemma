import { PRODUCT_STATUSES, productStatusLabels, type Category, type ProductDetail } from "@/features/catalog/types";

type ProductFieldsProps = {
  categories: Category[];
  product?: ProductDetail;
};

export const ProductFields = ({ categories, product }: ProductFieldsProps): React.ReactNode => (
  <div className="grid gap-4 sm:grid-cols-2">
    {product && <input type="hidden" name="id" value={product.id} />}
    <div>
      <label htmlFor="name">Nama seri</label>
      <input id="name" name="name" defaultValue={product?.name} required />
    </div>
    <div>
      <label htmlFor="slug">Slug (alamat halaman)</label>
      <input id="slug" name="slug" defaultValue={product?.slug} placeholder="sevina-polka" required />
    </div>
    <div>
      <label htmlFor="categoryId">Kategori</label>
      <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} required>
        <option value="" disabled>
          Pilih kategori
        </option>
        {categories.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label htmlFor="status">Status</label>
      <select id="status" name="status" defaultValue={product?.status ?? "draft"}>
        {PRODUCT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {productStatusLabels[status]}
          </option>
        ))}
      </select>
    </div>
    <div className="sm:col-span-2">
      <label htmlFor="description">Deskripsi (opsional)</label>
      <textarea id="description" name="description" defaultValue={product?.description ?? ""} className="!max-w-none" />
    </div>
    <fieldset className="sm:col-span-2">
      <legend>Custom ukuran</legend>
      <div>
        <input id="customSizeEnabled" name="customSizeEnabled" type="checkbox" defaultChecked={product?.customSizeEnabled} />
        <label htmlFor="customSizeEnabled">Agen boleh memesan custom ukuran (lingkar dada ≤ 140 cm, panjang badan ≤ 145 cm)</label>
      </div>
      <div>
        <label htmlFor="customUnitPrice">Harga custom per pcs (Rp)</label>
        <input
          id="customUnitPrice"
          name="customUnitPrice"
          inputMode="numeric"
          defaultValue={product?.customUnitPrice ?? ""}
          placeholder="350.000"
          className="sm:!max-w-60"
        />
      </div>
    </fieldset>
  </div>
);
