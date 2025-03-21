<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with('user');

        if ($request->has('start_date')) {
            $query->where('sale_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('sale_date', '<=', $request->end_date);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $sales = $query->get();

        $totals = [
            'total_sales' => $sales->sum('total_amount'),
            'sales_by_client' => $sales->groupBy('client')
                ->map(fn($group) => $group->sum('total_amount'))
                ->toArray(),
            'sales_by_user' => $sales->groupBy('user.name')
                ->map(fn($group) => [
                    'user' => $group->first()->user->name,
                    'total' => $group->sum('total_amount')
                ])
                ->values()
                ->toArray()
        ];

        return response()->json([
            'sales' => $sales,
            'totals' => $totals
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'client' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'sale_date' => 'required|date',
            'user_id' => 'required|exists:users,id'
        ]);

        $sale = Sale::create($validatedData);
        $sale->load('user');

        return response()->json($sale, 201);
    }

    public function update(Request $request, Sale $sale)
    {
        $validatedData = $request->validate([
            'client' => 'sometimes|required|string|max:255',
            'total_amount' => 'sometimes|required|numeric|min:0',
            'sale_date' => 'sometimes|required|date',
            'user_id' => 'sometimes|required|exists:users,id'
        ]);

        $sale->update($validatedData);
        $sale->load('user');

        return response()->json($sale);
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response()->json(null, 204);
    }
}