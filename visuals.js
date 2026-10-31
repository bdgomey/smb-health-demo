/* Owner's Ledger visual comparisons. Exact figures remain available as text. */
(() => {
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const source = (el) => {
    const result = dash.data(el.dataset.source);
    if (result.status !== 'ok') { BV.notReady(el, result); return null; }
    return result.data;
  };

  dash.draw('bank_bar', (el) => {
    const rows = source(el); if (!rows) return;
    const t = rows[0];
    const fraction = t.cash > 0 ? Math.max(0, Math.min(1, t.free_cash / t.cash)) : 0;
    const button = node('button', 'bv-cash-bar'); button.type = 'button';
    button.setAttribute('aria-label', 'Toggle reserve breakdown: ' + BV.fmt.money(t.spoken_for) + ' reserved, ' + BV.fmt.money(t.free_cash) + ' after reserves');
    button.setAttribute('aria-controls', 'reserve-details');
    const detail = document.getElementById('reserve-details');
    button.setAttribute('aria-expanded', String(detail.open));
    button.onclick = () => { detail.open = !detail.open; button.setAttribute('aria-expanded', String(detail.open)); };
    detail.ontoggle = () => button.setAttribute('aria-expanded', String(detail.open));
    const reserved = node('span', 'bv-cash-reserved'), remaining = node('span', 'bv-cash-remaining');
    reserved.style.width = (100 * (1 - fraction)) + '%'; remaining.style.width = (100 * fraction) + '%';
    button.append(reserved, remaining);
    const key = node('div', 'bv-cash-key');
    key.append(node('span', '', 'Reserved ' + BV.fmt.moneyk(t.spoken_for)));
    const result = t.free_cash < 0 ? 'Reserve shortfall ' + BV.fmt.moneyk(-t.free_cash) : t.cash > 0 ? BV.fmt.pct(fraction) + ' remains after reserves' : 'No positive bank balance';
    key.append(node('b', '', result)); el.replaceChildren(button, key);
  });

  dash.draw('cash_walk', (el) => {
    const rows = source(el); if (!rows) return;
    const visible = rows.filter((r) => ['profit', 'cash_change'].includes(r.step) || Math.abs(r.amount) >= .5);
    const lo = Math.min(0, ...visible.flatMap((r) => [r.start, r.end]));
    const hi = Math.max(0, ...visible.flatMap((r) => [r.start, r.end]));
    const position = (n) => 100 * (n - lo) / (hi - lo || 1);
    const labels = {profit:'Profit', depreciation:'Depreciation added back', receivables:'Change in receivables', inventory:'Inventory and prepayments', deposits:'Customer advances', payables:'Change in unpaid obligations', capex:'Equipment bought', loans_in:'New borrowing', loans_out:'Principal repaid', owner:'Owner draws', other:'Unreconciled difference', cash_change:'Bank balance change'};
    el.replaceChildren(...visible.map((r) => {
      const total = ['profit', 'cash_change'].includes(r.step);
      const row = node('div', 'bv-walk-row' + (total ? ' bv-walk-total' : '')); row.dataset.step = r.step;
      const track = node('div', 'bv-walk-track'); track.setAttribute('aria-hidden', 'true');
      const bar = node('i'); bar.style.left = position(Math.min(r.start, r.end)) + '%'; bar.style.width = Math.abs(position(r.end) - position(r.start)) + '%';
      bar.style.background = total ? 'var(--color-fg)' : r.amount < 0 ? 'var(--color-bad)' : 'var(--s0)';
      const zero = node('span', 'bv-walk-zero'); zero.style.left = position(0) + '%'; track.append(zero, bar);
      row.append(node('span', '', labels[r.step]), node('b', '', BV.fmt.smoney(r.amount)), track); return row;
    }));
  });

  dash.draw('health_bullet', (el) => {
    const rows = source(el); if (!rows) return;
    const r = BV.rowOf(el, rows); el.replaceChildren();
    if (!r || r.value == null || !Number.isFinite(r.value)) return;
    const lo = Math.min(0, r.value, r.target) * 1.2;
    const hi = Math.max(0, r.value, r.target) * 1.2;
    const position = (n) => 100 * (n - lo) / (hi - lo || 1);
    const target = node('span', 'bv-bullet-target'), actual = node('span', 'bv-bullet-value');
    target.style.left = position(r.target) + '%'; actual.style.left = position(r.value) + '%';
    actual.style.background = r.status === 'Risk' ? 'var(--color-bad)' : r.status === 'Watch' ? 'var(--color-warn)' : 'var(--color-ok)';
    el.append(target, actual);
  });

  document.querySelectorAll('[data-channel-metric]').forEach((button) => button.addEventListener('click', () => dash.setParams({channel_metric:button.dataset.channelMetric})));
  dash.draw('channel_bars', (el) => {
    const data = source(el); if (!data) return;
    const metric = dash.params().channel_metric;
    const byCost = metric === 'cac';
    const opened = new Set([...el.querySelectorAll('details[open]')].map((d) => d.dataset.channel));
    const rows = [...data].sort((a, b) => byCost ? a.cac - b.cac : b.return_per_dollar - a.return_per_dollar);
    const max = Math.max(...rows.map((r) => r[metric]), 1);
    document.querySelectorAll('[data-channel-metric]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.channelMetric === metric)));
    el.replaceChildren(...rows.map((r) => {
      const detail = node('details', 'bv-channel'); detail.dataset.channel = r.channel; detail.open = opened.has(r.channel);
      const summary = node('summary'), track = node('span', 'bv-channel-track'), bar = node('i');
      track.setAttribute('aria-hidden', 'true'); bar.style.width = (100 * r[metric] / max) + '%'; track.append(bar);
      summary.append(node('span', '', r.channel), node('b', '', byCost ? BV.fmt.money(r.cac) : BV.fmt.money2(r.return_per_dollar)), track);
      const body = node('div', 'bv-channel-detail', BV.fmt.money(r.spend) + ' spent · ' + BV.fmt.int(r.new_customers) + ' new customers · ' + BV.fmt.pct0(r.close_rate) + ' lead conversion');
      detail.append(summary, body); return detail;
    }));
  });

  dash.draw('people', (el) => {
    const data = source(el); if (!data) return;
    const opened = new Set([...el.querySelectorAll('details[open]')].map((d) => d.dataset.person));
    const rows = [...data].sort((a, b) => b.total - a.total), max = Math.max(...rows.map((r) => r.total), 1);
    el.replaceChildren(...rows.map((r) => {
      const detail = node('details', 'bv-person'), summary = node('summary'), top = node('span', 'bv-person-top'), bar = node('span', 'bv-person-bar');
      detail.dataset.person = r.id; detail.open = opened.has(r.id);
      top.append(node('span', '', r.role), node('b', '', BV.fmt.money(r.total))); bar.setAttribute('aria-hidden', 'true');
      const parts = [['Wages',r.wages],['Employer taxes',r.payroll_taxes],['Benefits and insurance',r.benefits],['Job support',r.other]];
      parts.forEach((part, i) => { const piece = node('span'); piece.style.width = (100 * part[1] / max) + '%'; piece.style.background = dash.colors[i]; bar.append(piece); });
      summary.append(top, bar);
      const costs = node('dl', 'bv-person-breakdown'); parts.forEach(([label, amount]) => costs.append(node('dt','',label),node('dd','',BV.fmt.money(amount))));
      costs.append(node('dt','','Recurring cost / worked hour'),node('dd','',BV.fmt.money(r.per_hour)));
      detail.append(summary, costs); return detail;
    }));
  });

  dash.draw('profit_trend', (el) => {
    const data = source(el); if (!data) return;
    const rows = data.slice(-12), W = Math.max(240, el.clientWidth), H = 190;
    el.replaceChildren();
    const svg = d3.select(el).append('svg').attr('width','100%').attr('viewBox',`0 0 ${W} ${H}`).attr('role','img').attr('aria-label','Monthly profit, last 12 months, with negative months below zero');
    const low = Math.min(0, ...rows.map((r) => r.profit)), high = Math.max(0, ...rows.map((r) => r.profit));
    const y = d3.scaleLinear([low * 1.2, high * 1.15 || 1],[H-28,18]).nice();
    const x = d3.scaleBand(rows.map((r) => r.month),[4,W-4]).padding(.35);
    svg.append('line').attr('x1',0).attr('x2',W).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','var(--cds-chart-axis)');
    rows.forEach((r,i) => {
      const cx=x(r.month)+x.bandwidth()/2;
      const bar=svg.append('rect').attr('x',x(r.month)).attr('width',x.bandwidth()).attr('y',y(Math.max(0,r.profit))).attr('height',Math.max(2,Math.abs(y(r.profit)-y(0)))).attr('fill',r.profit<0?'var(--color-bad)':'var(--s0)');
      bar.append('title').text(r.month+': '+BV.fmt.smoney(r.profit));
      if(i%3===0||i===11)svg.append('text').attr('x',cx).attr('y',H-6).attr('text-anchor','middle').attr('fill','var(--color-fg-muted)').attr('font-size',11).text(d3.utcFormat('%b')(new Date(r.month+'-01T00:00:00Z')));
    });
    const last=rows.at(-1);
    svg.append('text').attr('x',W-4).attr('y',14).attr('text-anchor','end').attr('fill',last.profit<0?'var(--color-bad)':'var(--color-fg)').attr('font-size',12).text('Latest: '+BV.fmt.smoney(last.profit));
    const values=node('details','bv-fold');values.append(node('summary','','Monthly profit figures'));
    const list=node('dl','bv-person-breakdown');rows.forEach(r=>list.append(node('dt','',r.month),node('dd','',BV.fmt.smoney(r.profit))));values.append(list);el.append(values);
  });

  dash.draw('hire_annotation', (el) => {
    const rows=source(el); if(!rows)return;
    el.dataset.where=BV.hireWhere(el); const row=BV.rowOf(el,rows);
    if(!row){el.replaceChildren('Scenario unavailable');return;}
    el.replaceChildren(node('span','','Largest modeled deficit: '),node('b','',BV.fmt.money(-row.low_point)+' in month '+row.low_month));
  });
})();
