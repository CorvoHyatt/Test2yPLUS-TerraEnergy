<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with('user');

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('sale_date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $sales = $query->get();

        return response()->json([
            'sales' => $sales,
            'totals' => [
                'total_sales' => $sales->sum('total_amount'),
                'sales_by_client' => $sales->groupBy('client')
                    ->map(fn($group) => $group->sum('total_amount')),
                'sales_by_user' => $sales->groupBy('user_id')
                    ->map(fn($group) => [
                        'user' => $group->first()->user->name,
                        'total' => $group->sum('total_amount')
                    ])
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client' => 'required|string',
            'total_amount' => 'required|numeric|min:0',
            'sale_date' => 'required|date',
            'user_id' => 'required|exists:users,id'
        ]);

        $sale = Sale::create($validated);
        return response()->json($sale, 201);
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load('user'));
    }

    public function update(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'client' => 'string',
            'total_amount' => 'numeric|min:0',
            'sale_date' => 'date',
            'user_id' => 'exists:users,id'
        ]);

        $sale->update($validated);
        return response()->json($sale);
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response()->json(null, 204);
    }
}